import { Router } from 'express';
import { prisma } from '../libs/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { success, fail } from '../utils/response';

const router = Router();
router.use(authMiddleware);

// Validation schemas
const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
});

// Helper: get org ID from header or user
function getOrganizationId(req: AuthRequest): string | null {
  return (
    (req.headers['x-organization-id'] as string) ||
    req.user?.organizationId ||
    null
  );
}

// POST /api/projects  → Create project
router.post('/', async (req: AuthRequest, res) => {
  try {
    const orgId = getOrganizationId(req);
    if (!orgId) return res.status(400).json(fail('Organization ID missing'));

    const data = createSchema.parse(req.body);
    console.log(data)
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description || '',
        status: data.status || 'ACTIVE',
        organizationId: orgId,
        createdById: req.user!.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'project.create',
        meta: { projectId: project.id },
      },
    });

    res.status(201).json(success(project, 'Project created successfully'));
  } catch (err) {
    console.error('Project creation error:', err);
    res
      .status(400)
      .json(fail(err instanceof Error ? err.message : 'Invalid input'));
  }
});

// GET /api/projects → Get all projects for org
router.get('/', async (req: AuthRequest, res) => {
  try {
    const orgId = getOrganizationId(req);
    if (!orgId) return res.status(400).json(fail('Organization ID missing'));

    const projects = await prisma.project.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(success(projects));
  } catch (err) {
    console.error('Project fetch error:', err);
    res.status(500).json(fail('Failed to fetch projects'));
  }
});

// GET /api/projects/:id → Get project by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const orgId = getOrganizationId(req);
    if (!orgId) return res.status(400).json(fail('Organization ID missing'));

    const id = req.params.id;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project || project.organizationId !== orgId)
      return res.status(404).json(fail('Project not found'));

    res.json(success(project));
  } catch (err) {
    console.error('Project get error:', err);
    res.status(500).json(fail('Failed to fetch project'));
  }
});

// PUT /api/projects/:id → Update project
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const orgId = getOrganizationId(req);
    if (!orgId) return res.status(400).json(fail('Organization ID missing'));

    const id = req.params.id;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project || project.organizationId !== orgId)
      return res.status(404).json(fail('Project not found'));

    const data = updateSchema.parse(req.body);

    const updated = await prisma.project.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'project.update',
        meta: { projectId: id, changes: data },
      },
    });

    res.json(success(updated, 'Project updated successfully'));
  } catch (err) {
    console.error('Project update error:', err);
    res
      .status(400)
      .json(fail(err instanceof Error ? err.message : 'Invalid input'));
  }
});

// DELETE /api/projects/:id → Delete project
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const orgId = getOrganizationId(req);
    if (!orgId) return res.status(400).json(fail('Organization ID missing'));

    const id = req.params.id;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project || project.organizationId !== orgId)
      return res.status(404).json(fail('Project not found'));

    await prisma.project.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'project.delete',
        meta: { projectId: id },
      },
    });

    res.json(success(null, 'Project deleted successfully'));
  } catch (err) {
    console.error('Project delete error:', err);
    res.status(500).json(fail('Failed to delete project'));
  }
});

export default router;
