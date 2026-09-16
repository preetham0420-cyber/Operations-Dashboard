import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken, requireManager } from '../middleware/auth.js';

const router = Router();

// Get all tasks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        assignee: { select: { id: true, name: true, role: true, avatar: true } },
        team: true,
        createdBy: { select: { id: true, name: true } },
        checklists: { orderBy: { createdAt: 'asc' } },
        comments: {
          include: { author: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ tasks });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: { select: { id: true, name: true, role: true, avatar: true } },
        team: true,
        createdBy: { select: { id: true, name: true } },
        checklists: { orderBy: { createdAt: 'asc' } },
        comments: {
          include: { author: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id, title, description, priority, assigneeId, teamId, dueDate, checklists } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required' });

    const taskCount = await prisma.task.count();
    const generatedId = id || `TSK-${8900 + taskCount + 1}`;

    const task = await prisma.task.create({
      data: {
        id: generatedId,
        taskCode: generatedId,
        title,
        description,
        priority: priority || 'Medium',
        status: 'Open',
        progress: 0,
        dueDate: dueDate ? String(dueDate) : null,
        assigneeId: assigneeId || null,
        teamId: teamId || null,
        createdById: req.user.id,
      },
      include: {
        assignee: true,
        team: true,
        checklists: true
      }
    });

    if (checklists && Array.isArray(checklists)) {
      for (const item of checklists) {
        await prisma.taskChecklist.create({
          data: {
            taskId: task.id,
            title: typeof item === 'string' ? item : item.title,
            completed: false
          }
        });
      }
    }

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'TASK_CREATED',
        target: task.taskCode,
        detail: `Created task "${task.title}"`
      }
    });

    // Fetch complete newly created task
    const fullTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        assignee: true,
        team: true,
        checklists: true,
        comments: true
      }
    });

    res.status(201).json({ task: fullTask });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update progress (requires assignee or manager)
router.patch('/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { progress } = req.body;
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (task.status === 'in_review' || task.status === 'closed') {
      return res.status(400).json({ error: 'Cannot modify progress while task is in review or closed' });
    }

    if (!req.user.isManager && task.assigneeId !== req.user.id) {
      return res.status(403).json({ error: 'Only assignee or manager can update task progress' });
    }

    const newProgress = Math.max(0, Math.min(100, parseInt(progress, 10) || 0));
    let newStatus = task.status;
    if (newProgress > 0 && newStatus === 'open') newStatus = 'in_progress';

    const updated = await prisma.task.update({
      where: { id: task.id },
      data: { progress: newProgress, status: newStatus },
      include: { assignee: true, team: true, checklists: true, comments: true }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'TASK_PROGRESS_UPDATED',
        target: task.taskCode,
        detail: `Updated progress to ${newProgress}%`
      }
    });

    res.json({ task: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Submit for review (assignee or manager)
router.post('/:id/submit-review', authenticateToken, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (!req.user.isManager && task.assigneeId !== req.user.id) {
      return res.status(403).json({ error: 'Only assignee or manager can submit task for review' });
    }

    const updated = await prisma.task.update({
      where: { id: task.id },
      data: { status: 'in_review', progress: Math.max(task.progress, 90) },
      include: { assignee: true, team: true, checklists: true, comments: true }
    });

    // Notify Operations Managers
    const managers = await prisma.user.findMany({ where: { isManager: true } });
    for (const mgr of managers) {
      await prisma.notification.create({
        data: {
          recipientId: mgr.id,
          title: 'Task Ready for Review',
          message: `${req.user.name} submitted task ${task.taskCode} for operational sign-off.`,
          category: 'task'
        }
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'TASK_SUBMITTED_REVIEW',
        target: task.taskCode,
        detail: 'Submitted task for manager review'
      }
    });

    res.json({ task: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Close task (strictly manager only!)
router.post('/:id/close', authenticateToken, requireManager, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const updated = await prisma.task.update({
      where: { id: task.id },
      data: { status: 'Closed', progress: 100 },
      include: { assignee: true, team: true, checklists: true, comments: true }
    });

    if (req.body.resolutionNote) {
      await prisma.taskComment.create({
        data: {
          taskId: task.id,
          authorId: req.user.id,
          authorName: req.user.name,
          comment: `[RESOLUTION NOTE] ${req.body.resolutionNote}`
        }
      });
    }

    if (task.assigneeId) {
      await prisma.notification.create({
        data: {
          recipientId: task.assigneeId,
          title: 'Task Approved & Closed',
          message: `Manager ${req.user.name} reviewed and closed task ${task.taskCode}.`,
          category: 'task'
        }
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'TASK_CLOSED',
        target: task.taskCode,
        detail: 'Task closed by Operations Manager'
      }
    });

    res.json({ task: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to close task' });
  }
});

// Add comment
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) return res.status(400).json({ error: 'Comment text required' });

    const newComment = await prisma.taskComment.create({
      data: {
        taskId: req.params.id,
        authorId: req.user.id,
        authorName: req.user.name,
        comment: comment.trim()
      },
      include: { author: { select: { id: true, name: true, avatar: true } } }
    });

    res.status(201).json({ comment: newComment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Toggle checklist
router.patch('/:id/checklists/:checklistId', authenticateToken, async (req, res) => {
  try {
    const { completed } = req.body;
    const item = await prisma.taskChecklist.update({
      where: { id: req.params.checklistId },
      data: { completed: !!completed }
    });
    res.json({ checklist: item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle checklist' });
  }
});

export default router;
