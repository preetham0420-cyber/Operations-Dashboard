import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const activities = await prisma.activityLog.findMany({
      include: { user: { select: { id: true, name: true, role: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 25
    });
    res.json({ activities });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;
