import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

function sanitize(user) {
  const { password, ...safe } = user;
  return safe;
}

// GET /api/users
router.get('/', authenticateToken, async (req, res) => {
  try {
    let whereClause = { isActive: true };

    if (req.user.role.code === 'TEAM_LEADER') {
      whereClause.teamId = req.user.teamId;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: { role: true, department: true, team: true },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: {
        users: users.map(sanitize)
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to fetch users directory.' }
    });
  }
});

// GET /api/users/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { role: true, department: true, team: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User profile not found.' }
      });
    }

    res.json({
      success: true,
      data: { user: sanitize(user) }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve user profile.' }
    });
  }
});

export default router;
