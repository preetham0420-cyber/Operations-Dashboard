import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken, requireRole, requireTeamLeaderOrManager } from '../middleware/auth.js';

const router = Router();

// Helper to resolve task by ID or taskCode
async function findTaskByIdOrCode(identifier, includeRelations = true) {
  const include = includeRelations ? {
    assignee: { select: { id: true, name: true, role: true, avatar: true, email: true, teamId: true } },
    team: true,
    createdBy: { select: { id: true, name: true } },
    checklists: { orderBy: { createdAt: 'asc' } },
    comments: {
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' }
    },
    activities: {
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    }
  } : undefined;

  let task = await prisma.task.findUnique({
    where: { id: identifier },
    include
  });

  if (!task) {
    task = await prisma.task.findUnique({
      where: { taskCode: identifier },
      include
    });
  }

  return task;
}

// GET /api/tasks - Retrieve tasks with search, filters, and role-aware boundaries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, priority, teamId, departmentId, assigneeId, search } = req.query;
    const userRole = req.user.role.code;

    const where = {};

    // 1. Role-aware visibility boundary
    if (userRole === 'MANAGER') {
      if (teamId) where.teamId = teamId;
    } else if (userRole === 'TEAM_LEADER') {
      where.teamId = req.user.teamId;
    } else {
      // AGENT: sees tasks within their squad or directly assigned to them
      where.OR = [
        { teamId: req.user.teamId },
        { assigneeId: req.user.id }
      ];
    }

    // 2. Query filters
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }
    if (departmentId) {
      where.team = { departmentId };
    }
    if (search) {
      const searchFilter = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { taskCode: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      };
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          searchFilter
        ];
        delete where.OR;
      } else {
        where.OR = searchFilter.OR;
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, role: true, avatar: true, email: true } },
        team: true,
        createdBy: { select: { id: true, name: true } },
        checklists: { orderBy: { createdAt: 'asc' } },
        comments: {
          include: { author: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' }
        },
        activities: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: tasks
    });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch tasks from database.' }
    });
  }
});

// GET /api/tasks/:id - Retrieve single task by id or taskCode
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await findTaskByIdOrCode(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task could not be found with specified identifier.' }
      });
    }

    // Role-boundary check
    const userRole = req.user.role.code;
    if (userRole === 'TEAM_LEADER' && task.teamId && task.teamId !== req.user.teamId) {
      return res.status(403).json({
        success: false,
        error: { code: 'CROSS_TEAM_ACCESS_DENIED', message: 'You are not authorized to view tasks from another team.' }
      });
    }
    if (userRole === 'AGENT' && task.teamId && task.teamId !== req.user.teamId && task.assigneeId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: 'You are not authorized to view this task.' }
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (err) {
    console.error('Error fetching task details:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve task details.' }
    });
  }
});

// POST /api/tasks - Create new task (Manager or Team Leader)
router.post('/', authenticateToken, requireTeamLeaderOrManager, async (req, res) => {
  try {
    const { id, taskCode, title, summary, description, priority, assigneeId, teamId, dueDate, checklists } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Task title is required.' }
      });
    }

    const userRole = req.user.role.code;
    let assignedTeamId = teamId || req.user.teamId;

    // Team Leader boundary check: Cannot create tasks for other teams
    if (userRole === 'TEAM_LEADER') {
      if (teamId && teamId !== req.user.teamId) {
        return res.status(403).json({
          success: false,
          error: { code: 'CROSS_TEAM_ACCESS_DENIED', message: 'Team Leaders cannot create tasks for other teams.' }
        });
      }
      assignedTeamId = req.user.teamId;
    }

    const taskCount = await prisma.task.count();
    const generatedTaskCode = taskCode || ('TSK-' + (100 + taskCount + 1));
    const generatedId = id || generatedTaskCode.toLowerCase();

    const taskData = {
      id: generatedId,
      taskCode: generatedTaskCode,
      title: title.trim(),
      summary: summary || title.trim(),
      description: description || '',
      priority: priority || 'Medium',
      status: 'OPEN',
      progress: 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      teamId: assignedTeamId || null,
      assigneeId: assigneeId || null,
      createdById: req.user.id
    };

    if (Array.isArray(checklists) && checklists.length > 0) {
      taskData.checklists = {
        create: checklists.map(c => ({
          title: typeof c === 'string' ? c : c.title,
          completed: c.completed || false
        }))
      };
    }

    // Activity log creation
    taskData.activities = {
      create: {
        userId: req.user.id,
        action: 'CREATED',
        detail: 'Task created by ' + req.user.name + ' (' + userRole + ')'
      }
    };

    const newTask = await prisma.task.create({
      data: taskData,
      include: {
        assignee: { select: { id: true, name: true, role: true, avatar: true } },
        team: true,
        createdBy: { select: { id: true, name: true } },
        checklists: true,
        activities: true
      }
    });

    res.status(201).json({
      success: true,
      data: newTask
    });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to create task.' }
    });
  }
});

// PATCH /api/tasks/:id - General update
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await findTaskByIdOrCode(req.params.id, false);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' }
      });
    }

    const userRole = req.user.role.code;
    if (userRole === 'TEAM_LEADER' && task.teamId !== req.user.teamId) {
      return res.status(403).json({
        success: false,
        error: { code: 'CROSS_TEAM_ACCESS_DENIED', message: 'Unauthorized to update tasks outside your team.' }
      });
    }

    const { title, summary, description, priority, dueDate } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, role: true, avatar: true } },
        team: true
      }
    });

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update task.' }
    });
  }
});

// PATCH /api/tasks/:id/status - Status transition (OPEN -> IN_PROGRESS -> UNDER_REVIEW -> CLOSED)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'CLOSED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') }
      });
    }

    const task = await findTaskByIdOrCode(req.params.id, false);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' }
      });
    }

    const userRole = req.user.role.code;
    const oldStatus = task.status;

    // Permissions logic
    if (userRole === 'AGENT') {
      if (task.assigneeId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Agents can only transition status for tasks assigned to them.' }
        });
      }
      if (status === 'CLOSED') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only Managers or Team Leaders can approve and close tasks.' }
        });
      }
    } else if (userRole === 'TEAM_LEADER') {
      if (task.teamId && task.teamId !== req.user.teamId) {
        return res.status(403).json({
          success: false,
          error: { code: 'CROSS_TEAM_ACCESS_DENIED', message: 'Unauthorized to modify status for another team.' }
        });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: {
        status,
        activities: {
          create: {
            userId: req.user.id,
            action: 'STATUS_CHANGE',
            detail: 'Status changed from ' + oldStatus + ' to ' + status + ' by ' + req.user.name
          }
        }
      },
      include: {
        assignee: { select: { id: true, name: true, role: true, avatar: true } },
        team: true,
        activities: { orderBy: { createdAt: 'desc' } }
      }
    });

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update task status.' }
    });
  }
});

// PATCH /api/tasks/:id/progress - Constrained 0 - 100 with assignee lock
router.patch('/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { progress } = req.body;
    const numProgress = parseInt(progress, 10);

    if (isNaN(numProgress) || numProgress < 0 || numProgress > 100) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PROGRESS_RANGE', message: 'Progress must be an integer between 0 and 100.' }
      });
    }

    const task = await findTaskByIdOrCode(req.params.id, false);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' }
      });
    }

    const userRole = req.user.role.code;
    const oldProgress = task.progress;

    // Assignee progress lock
    if (userRole === 'AGENT') {
      if (task.assigneeId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { code: 'ASSIGNEE_LOCK', message: 'Assignee Lock: You can only update progress on tasks assigned directly to you.' }
        });
      }
    } else if (userRole === 'TEAM_LEADER') {
      if (task.teamId && task.teamId !== req.user.teamId) {
        return res.status(403).json({
          success: false,
          error: { code: 'CROSS_TEAM_ACCESS_DENIED', message: 'Unauthorized to update progress for another team.' }
        });
      }
    }

    const updatePayload = {
      progress: numProgress,
      activities: {
        create: {
          userId: req.user.id,
          action: 'PROGRESS_UPDATE',
          detail: 'Progress updated from ' + oldProgress + '% to ' + numProgress + '% by ' + req.user.name
        }
      }
    };

    if (numProgress === 100 && task.status === 'IN_PROGRESS') {
      updatePayload.status = 'UNDER_REVIEW';
    }

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: updatePayload,
      include: {
        assignee: { select: { id: true, name: true, role: true, avatar: true } },
        team: true,
        activities: { orderBy: { createdAt: 'desc' } }
      }
    });

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (err) {
    console.error('Error updating progress:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update task progress.' }
    });
  }
});

// PATCH /api/tasks/:id/assignee - Reassign task
router.patch('/:id/assignee', authenticateToken, requireTeamLeaderOrManager, async (req, res) => {
  try {
    const { assigneeId } = req.body;
    if (!assigneeId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Target assigneeId is required.' }
      });
    }

    const task = await findTaskByIdOrCode(req.params.id, false);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' }
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: assigneeId },
      include: { role: true, team: true }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Target assignee user not found.' }
      });
    }

    const userRole = req.user.role.code;

    if (userRole === 'TEAM_LEADER') {
      if (task.teamId && task.teamId !== req.user.teamId) {
        return res.status(403).json({
          success: false,
          error: { code: 'CROSS_TEAM_ACCESS_DENIED', message: 'You can only reassign tasks within your own team.' }
        });
      }
      if (targetUser.teamId !== req.user.teamId) {
        return res.status(403).json({
          success: false,
          error: { code: 'CROSS_TEAM_REASSIGNMENT_DENIED', message: 'Team Leaders can only reassign tasks to Agents within their own team.' }
        });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: {
        assigneeId: targetUser.id,
        activities: {
          create: {
            userId: req.user.id,
            action: 'REASSIGNED',
            detail: 'Task reassigned to ' + targetUser.name + ' by ' + req.user.name
          }
        }
      },
      include: {
        assignee: { select: { id: true, name: true, role: true, avatar: true } },
        team: true,
        activities: { orderBy: { createdAt: 'desc' } }
      }
    });

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (err) {
    console.error('Error reassigning task:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to reassign task.' }
    });
  }
});

// GET /api/tasks/:id/comments - Retrieve comments
router.get('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const task = await findTaskByIdOrCode(req.params.id, false);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' }
      });
    }

    const comments = await prisma.taskComment.findMany({
      where: { taskId: task.id },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: comments
    });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch comments.' }
    });
  }
});

// POST /api/tasks/:id/comments - Add comment
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Comment text is required.' }
      });
    }

    const task = await findTaskByIdOrCode(req.params.id, false);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' }
      });
    }

    const newComment = await prisma.taskComment.create({
      data: {
        taskId: task.id,
        authorId: req.user.id,
        authorName: req.user.name,
        comment: comment.trim()
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } }
      }
    });

    await prisma.taskActivity.create({
      data: {
        taskId: task.id,
        userId: req.user.id,
        action: 'COMMENT_ADDED',
        detail: req.user.name + ' added a comment'
      }
    });

    res.status(201).json({
      success: true,
      data: newComment
    });
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to post comment.' }
    });
  }
});

// GET /api/tasks/:id/activity - Get task audit activity history
router.get('/:id/activity', authenticateToken, async (req, res) => {
  try {
    const task = await findTaskByIdOrCode(req.params.id, false);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' }
      });
    }

    const activities = await prisma.taskActivity.findMany({
      where: { taskId: task.id },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: activities
    });
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch task activity.' }
    });
  }
});

export default router;
