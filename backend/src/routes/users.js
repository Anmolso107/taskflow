const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();
router.use(authenticate);

// GET /api/users/dashboard
router.get('/dashboard', async (req, res) => {
  const userId = req.user.id;
  try {
    const [tasksByStatus, overdueTasks, totalProjects] = await Promise.all([
      prisma.task.groupBy({
        by: ['status'],
        where: { assigneeId: userId },
        _count: { status: true }
      }),
      prisma.task.count({
        where: {
          assigneeId: userId,
          dueDate: { lt: new Date() },
          status: { not: 'DONE' }
        }
      }),
      prisma.project.count({
        where: { members: { some: { userId } } }
      })
    ]);
    res.json({ tasksByStatus, overdueTasks, totalProjects });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/search?q=
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } }
        ],
        NOT: { id: req.user.id }
      },
      select: { id: true, name: true, email: true },
      take: 5
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;