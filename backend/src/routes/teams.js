import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken, requireTeamAccess } from '../middleware/auth.js';

const router = Router();

// GET /api/teams
router.get('/', authenticateToken, async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role.code === 'TEAM_LEADER') {
      whereClause.id = req.user.teamId;
    }

    const teams = await prisma.team.findMany({
      where: whereClause,
      include: {
        department: true,
        leader: { select: { id: true, name: true, email: true, jobTitle: true, avatar: true } },
        members: { select: { id: true, name: true, email: true, jobTitle: true, shift: true, avatar: true } }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: { teams }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to fetch teams.' }
    });
  }
});

// GET /api/teams/:id (Protected with Team Boundary Guard)
router.get('/:id', authenticateToken, requireTeamAccess, async (req, res) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        leader: { select: { id: true, name: true, email: true, jobTitle: true, avatar: true } },
        members: { select: { id: true, name: true, email: true, jobTitle: true, shift: true, avatar: true } }
      }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Team not found.' }
      });
    }

    res.json({
      success: true,
      data: { team }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve team details.' }
    });
  }
});

export default router;
