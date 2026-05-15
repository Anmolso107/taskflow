const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireMember, requireAdmin } = require('../middleware/projectAccess');

const router = express.Router();
const prisma = new PrismaClient();
router.use(authenticate);

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user.id } } },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name required' });
  try {
    const project = await prisma.project.create({
      data: {
        name, description,
        ownerId: req.user.id,
        members: { create: { userId: req.user.id, role: 'ADMIN' } }
      },
      include: { members: true }
    });
    res.status(201).json(project);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects/:projectId
router.get('/:projectId', requireMember, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/projects/:projectId
router.put('/:projectId', requireAdmin, async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id: req.params.projectId },
      data: { name, description }
    });
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:projectId
router.delete('/:projectId', requireAdmin, async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.projectId } });
    res.json({ message: 'Project deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects/:projectId/members
router.post('/:projectId/members', requireAdmin, async (req, res) => {
  const { email, role = 'MEMBER' } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: req.params.projectId, userId: user.id } }
    });
    if (existing) return res.status(400).json({ error: 'User already a member' });

    const member = await prisma.projectMember.create({
      data: { projectId: req.params.projectId, userId: user.id, role },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.status(201).json(member);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:projectId/members/:userId
router.delete('/:projectId/members/:userId', requireAdmin, async (req, res) => {
  try {
    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId: req.params.projectId, userId: req.params.userId }
      }
    });
    res.json({ message: 'Member removed' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;