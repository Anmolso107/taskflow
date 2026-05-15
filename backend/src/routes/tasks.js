const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireMember } = require('../middleware/projectAccess');

const router = express.Router({ mergeParams: true });
const prisma = new PrismaClient();
router.use(authenticate);

// GET /api/projects/:projectId/tasks
router.get('/', requireMember, async (req, res) => {
  try {
    const { status, priority, assigneeId } = req.query;
    const tasks = await prisma.task.findMany({
      where: {
        projectId: req.params.projectId,
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assigneeId && { assigneeId })
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } }
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
    });
    res.json(tasks);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects/:projectId/tasks
router.post('/', requireMember, async (req, res) => {
  const { title, description, status, priority, dueDate, assigneeId } = req.body;
  if (!title) return res.status(400).json({ error: 'Task title required' });
  try {
    const task = await prisma.task.create({
      data: {
        title, description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: req.params.projectId,
        assigneeId: assigneeId || null,
        creatorId: req.user.id
      },
      include: { assignee: { select: { id: true, name: true, email: true } } }
    });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/projects/:projectId/tasks/:taskId
router.put('/:taskId', requireMember, async (req, res) => {
  const { title, description, status, priority, dueDate, assigneeId } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: req.params.taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null })
      },
      include: { assignee: { select: { id: true, name: true, email: true } } }
    });
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:projectId/tasks/:taskId
router.delete('/:taskId', requireMember, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.creatorId !== req.user.id && req.member.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.json({ message: 'Task deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;