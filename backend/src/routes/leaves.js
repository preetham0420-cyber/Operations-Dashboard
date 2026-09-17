import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken, requireTeamLeaderOrManager } from '../middleware/auth.js';

const router = Router();

// GET /api/leaves/me - Current user's submitted leaves
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      where: { userId: req.user.id },
      include: {
        reviewedBy: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: leaves
    });
  } catch (err) {
    console.error('Error fetching personal leaves:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve leave records.' }
    });
  }
});

// GET /api/leaves/pending - Pending leaves requiring supervisory approval
router.get('/pending', authenticateToken, requireTeamLeaderOrManager, async (req, res) => {
  try {
    const userRole = req.user.role.code;
    const where = { status: 'PENDING' };

    // Team Leader boundary: Only view pending leaves for their squad
    if (userRole === 'TEAM_LEADER') {
      where.user = { teamId: req.user.teamId };
    }

    const pendingLeaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, role: true, team: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: pendingLeaves
    });
  } catch (err) {
    console.error('Error fetching pending leaves:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve pending leave requests.' }
    });
  }
});

// GET /api/leaves - General leave directory (role-scoped)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role.code;
    const where = {};

    if (userRole === 'MANAGER') {
      // Sees all
    } else if (userRole === 'TEAM_LEADER') {
      where.user = { teamId: req.user.teamId };
    } else {
      where.userId = req.user.id;
    }

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true, role: true, team: true } },
        reviewedBy: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: leaves
    });
  } catch (err) {
    console.error('Error fetching leaves:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve leaves.' }
    });
  }
});

// POST /api/leaves - Submit a new leave request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, daysCount, reason } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'leaveType, startDate, and endDate are required.' }
      });
    }

    const newLeave = await prisma.leaveRequest.create({
      data: {
        userId: req.user.id,
        leaveType,
        startDate,
        endDate,
        daysCount: parseInt(daysCount, 10) || 1,
        reason: reason || '',
        status: 'PENDING'
      },
      include: {
        user: { select: { id: true, name: true, teamId: true } }
      }
    });

    // Notify managers and relevant team leader
    const supervisors = await prisma.user.findMany({
      where: {
        OR: [
          { role: { code: 'MANAGER' } },
          { role: { code: 'TEAM_LEADER' }, teamId: req.user.teamId }
        ]
      }
    });

    for (const sup of supervisors) {
      await prisma.notification.create({
        data: {
          userId: sup.id,
          title: 'New Leave Request',
          message: `${req.user.name} submitted a ${leaveType} request (${startDate} to ${endDate}).`,
          category: 'leave'
        }
      });
    }

    res.status(201).json({
      success: true,
      data: newLeave
    });
  } catch (err) {
    console.error('Error submitting leave:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to submit leave request.' }
    });
  }
});

// PATCH /api/leaves/:id/approve - Approve leave request
router.patch('/:id/approve', authenticateToken, requireTeamLeaderOrManager, async (req, res) => {
  try {
    const { reviewNotes } = req.body || {};
    const leave = await prisma.leaveRequest.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: { code: 'LEAVE_NOT_FOUND', message: 'Leave request not found.' }
      });
    }

    const userRole = req.user.role.code;
    if (userRole === 'TEAM_LEADER' && leave.user.teamId !== req.user.teamId) {
      return res.status(403).json({
        success: false,
        error: { code: 'CROSS_TEAM_ACCESS_DENIED', message: 'Team Leaders cannot approve leaves for other squads.' }
      });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: leave.id },
      data: {
        status: 'APPROVED',
        reviewedById: req.user.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || 'Approved by supervisor'
      },
      include: {
        user: { select: { id: true, name: true } },
        reviewedBy: { select: { id: true, name: true, role: true } }
      }
    });

    // Notify employee
    await prisma.notification.create({
      data: {
        userId: leave.userId,
        title: 'Leave Request Approved',
        message: `Your ${leave.leaveType} request for ${leave.startDate} has been APPROVED by ${req.user.name}.`,
        category: 'leave'
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    console.error('Error approving leave:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to approve leave request.' }
    });
  }
});

// PATCH /api/leaves/:id/reject - Reject leave request
router.patch('/:id/reject', authenticateToken, requireTeamLeaderOrManager, async (req, res) => {
  try {
    const { reviewNotes } = req.body || {};
    const leave = await prisma.leaveRequest.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: { code: 'LEAVE_NOT_FOUND', message: 'Leave request not found.' }
      });
    }

    const userRole = req.user.role.code;
    if (userRole === 'TEAM_LEADER' && leave.user.teamId !== req.user.teamId) {
      return res.status(403).json({
        success: false,
        error: { code: 'CROSS_TEAM_ACCESS_DENIED', message: 'Team Leaders cannot reject leaves for other squads.' }
      });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: leave.id },
      data: {
        status: 'REJECTED',
        reviewedById: req.user.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || 'Operational requirement conflict'
      },
      include: {
        user: { select: { id: true, name: true } },
        reviewedBy: { select: { id: true, name: true, role: true } }
      }
    });

    // Notify employee
    await prisma.notification.create({
      data: {
        userId: leave.userId,
        title: 'Leave Request Rejected',
        message: `Your ${leave.leaveType} request for ${leave.startDate} was not approved: ${updated.reviewNotes}`,
        category: 'leave'
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    console.error('Error rejecting leave:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to reject leave request.' }
    });
  }
});

export default router;
