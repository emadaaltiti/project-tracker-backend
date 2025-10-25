import { Router } from 'express';
import { prisma } from '../../src/libs/prisma';
import { authMiddleware, AuthRequest } from '../../src/middleware/auth';
import { z } from 'zod';
import { success, fail } from '../../src/utils/response';

const router = Router();
router.use(authMiddleware);

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['ACTIVE','COMPLETED']).optional()
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const data = createSchema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description || '',
        status: data.status || 'ACTIVE',
        organizationId: req.user!.organizationId,
        createdById: req.user!.id
      }
    });
    await prisma.auditLog.create({ data: { userId: req.user!.id, action: 'project.create', meta: { projectId: project.id } }});
    res.status(201).json(success(project, 'Project created'));
  } catch (err) {
    res.status(400).json(fail(err instanceof Error ? err.message : 'Invalid input'));
  }
});

router.get('/', async (req: AuthRequest, res) => {
  const orgId = req.user!.organizationId;
  const projects = await prisma.project.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' }});
  res.json(success(projects));
});

router.get('/:id', async (req: AuthRequest, res) => {
  const id = req.params.id;
  const proj = await prisma.project.findUnique({ where: { id }});
  if (!proj || proj.organizationId !== req.user!.organizationId) return res.status(404).json(fail('Not found'));
  res.json(success(proj));
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE','COMPLETED']).optional()
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id;
    const proj = await prisma.project.findUnique({ where: { id }});
    if (!proj || proj.organizationId !== req.user!.organizationId) return res.status(404).json(fail('Not found'));
    const data = updateSchema.parse(req.body);
    const updated = await prisma.project.update({ where: { id }, data });
    await prisma.auditLog.create({ data: { userId: req.user!.id, action: 'project.update', meta: { projectId: id, changes: data } }});
    res.json(success(updated));
  } catch (err) {
    res.status(400).json(fail(err instanceof Error ? err.message : 'Invalid input'));
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  const id = req.params.id;
  const proj = await prisma.project.findUnique({ where: { id }});
  if (!proj || proj.organizationId !== req.user!.organizationId) return res.status(404).json(fail('Not found'));
  await prisma.project.delete({ where: { id }});
  await prisma.auditLog.create({ data: { userId: req.user!.id, action: 'project.delete', meta: { projectId: id } }});
  res.json(success(null, 'Deleted'));
});

export default router;
