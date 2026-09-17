import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/dashboard/summary - Dynamic operational metrics directly from PostgreSQL
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role.code;
    const taskWhere = {};
    const userWhere = { isActive: true };

    if (userRole === 'MANAGER') {
      // Organization-wide scope
    } else if (userRole === 'TEAM_LEADER') {
      taskWhere.teamId = req.user.teamId;
      userWhere.teamId = req.user.teamId;
    } else {
      // AGENT scope
      taskWhere.OR = [
        { teamId: req.user.teamId },
        { assigneeId: req.user.id }
      ];
      userWhere.teamId = req.user.teamId;
    }

    // 1. Task calculations
    const allTasks = await prisma.task.findMany({
      where: taskWhere,
      select: { id: true, status: true, priority: true }
    });

    const totalTasks = allTasks.length;
    let openTasks = 0;
    let inProgressTasks = 0;
    let underReviewTasks = 0;
    let closedTasks = 0;
    let highPriorityTasks = 0;

    for (const t of allTasks) {
      if (t.status === 'OPEN') openTasks++;
      else if (t.status === 'IN_PROGRESS') inProgressTasks++;
      else if (t.status === 'UNDER_REVIEW') underReviewTasks++;
      else if (t.status === 'CLOSED') closedTasks++;

      if (t.priority === 'High' || t.priority === 'Critical') {
        highPriorityTasks++;
      }
    }

    const completionRate = totalTasks > 0 ? Math.round((closedTasks / totalTasks) * 100) : 0;

    // 2. Personnel / Shift calculations
    const totalTeamMembers = await prisma.user.count({
      where: userWhere
    });

    // Today's active clocked-in count
    const todayStr = new Date().toISOString().split('T')[0];
    const attendanceWhere = {
      date: todayStr,
      currentStatus: 'Clocked In'
    };

    if (userRole !== 'MANAGER' && req.user.teamId) {
      attendanceWhere.user = { teamId: req.user.teamId };
    }

    const activeOnDuty = await prisma.attendanceRecord.count({
      where: attendanceWhere
    });

    // 3. Pending leave requests count
    const leaveWhere = { status: 'PENDING' };
    if (userRole !== 'MANAGER') {
      leaveWhere.user = { teamId: req.user.teamId };
    }
    const pendingLeaves = await prisma.leaveRequest.count({
      where: leaveWhere
    });

    res.json({
      success: true,
      data: {
        role: userRole,
        scope: userRole === 'MANAGER' ? 'ORGANIZATION' : (req.user.team?.name || 'SQUAD'),
        totalTasks,
        openTasks,
        inProgressTasks,
        underReviewTasks,
        closedTasks,
        completionRate,
        highPriorityTasks,
        totalTeamMembers,
        activeOnDuty,
        pendingLeaves,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error generating dashboard summary:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to compute dashboard metrics from database.' }
    });
  }
});

export default router;
