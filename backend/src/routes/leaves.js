import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken, requireManager } from '../middleware/auth.js';

const router = Router();

// Get leaves
router.get('/', authenticateToken, async (req, res) => {
  try {
    let where = {};
    if (!req.user.isManager) {
      where.userId = req.user.id;
    }

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, role: true, department: true, avatar: true } },
        reviewedBy: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ leaves });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaves' });
  }
});

// Apply for leave
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, durationDays, reason } = req.body;
    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({ error: 'Leave type, start date, and end date are required' });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        userId: req.user.id,
        leaveType,
        startDate,
        endDate,
        durationDays: parseInt(durationDays, 10) || 1,
        reason: reason || '',
        status: 'pending'
      },
      include: { user: true }
    });

    // Notify Operations Managers
    const managers = await prisma.user.findMany({ where: { isManager: true } });
    for (const mgr of managers) {
      await prisma.notification.create({
        data: {
          recipientId: mgr.id,
          title: 'New Leave Request',
          message: `${req.user.name} submitted a ${leaveType} request for ${startDate} to ${endDate}.`,
          category: 'leave'
        }
      });
    }

    res.status(201).json({ leave });
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply leave' });
  }
});

// Approve leave (strictly manager only)
router.patch('/:id/approve', authenticateToken, requireManager, async (req, res) => {
  try {
    const { reviewNotes } = req.body;
    const leave = await prisma.leaveRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'approved',
        reviewedById: req.user.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || 'Approved by Operations Manager'
      },
      include: { user: true }
    });

    await prisma.notification.create({
      data: {
        recipientId: leave.userId,
        title: 'Leave Request Approved',
        message: `Your ${leave.leaveType} has been approved by ${req.user.name}.`,
        category: 'leave'
      }
    });

    res.json({ leave });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve leave' });
  }
});

// Reject leave (strictly manager only)
router.patch('/:id/reject', authenticateToken, requireManager, async (req, res) => {
  try {
    const { reviewNotes } = req.body;
    const leave = await prisma.leaveRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'rejected',
        reviewedById: req.user.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || 'Declined per operational scheduling requirements'
      },
      include: { user: true }
    });

    await prisma.notification.create({
      data: {
        recipientId: leave.userId,
        title: 'Leave Request Declined',
        message: `Your ${leave.leaveType} was declined by ${req.user.name}.`,
        category: 'leave'
      }
    });

    res.json({ leave });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject leave' });
  }
});

export default router;
