const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const requireMember = async (req, res, next) => {
  const { projectId } = req.params;
  try {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user.id } }
    });
    if (!member) return res.status(403).json({ error: 'Not a project member' });
    req.member = member;
    next();
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

const requireAdmin = async (req, res, next) => {
  const { projectId } = req.params;
  try {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user.id } }
    });
    if (!member || member.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.member = member;
    next();
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { requireMember, requireAdmin };