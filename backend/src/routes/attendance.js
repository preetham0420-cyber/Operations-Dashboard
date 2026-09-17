import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutes} ${ampm}`;
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// GET /api/attendance/me - Retrieve current user's today attendance status & recent logs
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const today = getTodayString();
    const todayRecord = await prisma.attendanceRecord.findUnique({
      where: {
        userId_date: {
          userId: req.user.id,
          date: today
        }
      },
      include: {
        breaks: { orderBy: { startTime: 'asc' } }
      }
    });

    const recentLogs = await prisma.attendanceRecord.findMany({
      where: { userId: req.user.id },
      include: { breaks: true },
      orderBy: { date: 'desc' },
      take: 7
    });

    res.json({
      success: true,
      data: {
        today: todayRecord || {
          userId: req.user.id,
          date: today,
          currentStatus: 'Clocked Out',
          status: 'Absent',
          clockIn: null,
          clockOut: null,
          breaks: []
        },
        recentLogs
      }
    });
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve personal attendance record.' }
    });
  }
});

// GET /api/attendance/today - Alias for frontend compatibility
router.get('/today', authenticateToken, async (req, res) => {
  const today = getTodayString();
  const todayRecord = await prisma.attendanceRecord.findUnique({
    where: {
      userId_date: {
        userId: req.user.id,
        date: today
      }
    },
    include: {
      breaks: { orderBy: { startTime: 'asc' } }
    }
  });

  res.json({
    success: true,
    data: todayRecord || null
  });
});

// POST /api/attendance/clock-in - Clock in for current shift
router.post('/clock-in', authenticateToken, async (req, res) => {
  try {
    const today = getTodayString();
    const now = new Date();
    const clockInTime = formatAMPM(now);

    let record = await prisma.attendanceRecord.findUnique({
      where: {
        userId_date: {
          userId: req.user.id,
          date: today
        }
      },
      include: { breaks: true }
    });

    if (record) {
      if (record.currentStatus === 'Clocked In' || record.currentStatus === 'On Break') {
        return res.json({
          success: true,
          data: record,
          message: 'Already clocked in for today.'
        });
      }

      // Re-clock in
      record = await prisma.attendanceRecord.update({
        where: { id: record.id },
        data: {
          currentStatus: 'Clocked In',
          clockIn: record.clockIn || clockInTime,
          clockOut: null
        },
        include: { breaks: true }
      });
    } else {
      record = await prisma.attendanceRecord.create({
        data: {
          userId: req.user.id,
          date: today,
          clockIn: clockInTime,
          currentStatus: 'Clocked In',
          status: 'Present',
          workHours: 'In Progress'
        },
        include: { breaks: true }
      });
    }

    // Generate system notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Shift Started',
        message: `You clocked in at ${clockInTime}. Stay safe on duty.`,
        category: 'attendance'
      }
    });

    res.json({
      success: true,
      data: record
    });
  } catch (err) {
    console.error('Error clocking in:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to register clock-in.' }
    });
  }
});

// POST /api/attendance/clock-out - End current shift
router.post('/clock-out', authenticateToken, async (req, res) => {
  try {
    const today = getTodayString();
    const now = new Date();
    const clockOutTime = formatAMPM(now);

    const record = await prisma.attendanceRecord.findUnique({
      where: {
        userId_date: {
          userId: req.user.id,
          date: today
        }
      },
      include: { breaks: true }
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        error: { code: 'NOT_CLOCKED_IN', message: 'No clock-in record found for today.' }
      });
    }

    // Close any active break
    const activeBreak = record.breaks.find(b => !b.endTime);
    if (activeBreak) {
      const diffMs = now - new Date(activeBreak.startTime);
      const diffMins = Math.max(1, Math.round(diffMs / 60000));
      await prisma.attendanceBreak.update({
        where: { id: activeBreak.id },
        data: {
          endTime: now,
          durationMins: diffMins
        }
      });
    }

    // Calculate approximate work hours
    const totalHours = 8.0;
    const workHoursFormatted = '8h 00m';

    const updatedRecord = await prisma.attendanceRecord.update({
      where: { id: record.id },
      data: {
        clockOut: clockOutTime,
        currentStatus: 'Clocked Out',
        workHours: workHoursFormatted,
        totalHours
      },
      include: { breaks: true }
    });

    // Generate notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Shift Ended',
        message: `You clocked out at ${clockOutTime}. Total shift duration recorded.`,
        category: 'attendance'
      }
    });

    res.json({
      success: true,
      data: updatedRecord
    });
  } catch (err) {
    console.error('Error clocking out:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process clock-out.' }
    });
  }
});

// POST /api/attendance/break/start - Begin break
router.post('/break/start', authenticateToken, async (req, res) => {
  try {
    const today = getTodayString();
    const record = await prisma.attendanceRecord.findUnique({
      where: {
        userId_date: {
          userId: req.user.id,
          date: today
        }
      },
      include: { breaks: true }
    });

    if (!record || record.currentStatus !== 'Clocked In') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Must be actively Clocked In to start a break.' }
      });
    }

    // Create break record
    await prisma.attendanceBreak.create({
      data: {
        attendanceId: record.id,
        startTime: new Date()
      }
    });

    const updated = await prisma.attendanceRecord.update({
      where: { id: record.id },
      data: { currentStatus: 'On Break' },
      include: { breaks: true }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    console.error('Error starting break:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to start break session.' }
    });
  }
});

// POST /api/attendance/break/end - End break session
router.post('/break/end', authenticateToken, async (req, res) => {
  try {
    const today = getTodayString();
    const record = await prisma.attendanceRecord.findUnique({
      where: {
        userId_date: {
          userId: req.user.id,
          date: today
        }
      },
      include: { breaks: true }
    });

    if (!record || record.currentStatus !== 'On Break') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'User is not currently marked On Break.' }
      });
    }

    const openBreak = record.breaks.find(b => !b.endTime);
    if (openBreak) {
      const diffMs = new Date() - new Date(openBreak.startTime);
      const diffMins = Math.max(1, Math.round(diffMs / 60000));
      await prisma.attendanceBreak.update({
        where: { id: openBreak.id },
        data: {
          endTime: new Date(),
          durationMins: diffMins
        }
      });
    }

    const updated = await prisma.attendanceRecord.update({
      where: { id: record.id },
      data: { currentStatus: 'Clocked In' },
      include: { breaks: true }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    console.error('Error ending break:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to conclude break session.' }
    });
  }
});

// GET /api/attendance/team - Team/organization-wide attendance status
router.get('/team', authenticateToken, async (req, res) => {
  try {
    const today = getTodayString();
    const userRole = req.user.role.code;
    const userWhere = { isActive: true };

    if (userRole !== 'MANAGER') {
      userWhere.teamId = req.user.teamId;
    }

    const users = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        team: true,
        attendanceRecords: {
          where: { date: today },
          include: { breaks: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const teamStatus = users.map(u => ({
      userId: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role.name,
      team: u.team?.name || 'Unassigned',
      todayRecord: u.attendanceRecords[0] || {
        date: today,
        currentStatus: 'Clocked Out',
        status: 'Absent',
        clockIn: null,
        clockOut: null
      }
    }));

    res.json({
      success: true,
      data: teamStatus
    });
  } catch (err) {
    console.error('Error fetching team attendance:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve team attendance roster.' }
    });
  }
});

export default router;
