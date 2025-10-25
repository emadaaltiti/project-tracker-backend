"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../libs/prisma");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// Validation schemas
const createSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'COMPLETED']).optional(),
});
const updateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'COMPLETED']).optional(),
});
// Helper: get org ID from header or user
function getOrganizationId(req) {
    return (req.headers['x-organization-id'] ||
        req.user?.organizationId ||
        null);
}
// POST /api/projects  → Create project
router.post('/', async (req, res) => {
    try {
        const orgId = getOrganizationId(req);
        if (!orgId)
            return res.status(400).json((0, response_1.fail)('Organization ID missing'));
        const data = createSchema.parse(req.body);
        console.log(data);
        const project = await prisma_1.prisma.project.create({
            data: {
                title: data.title,
                description: data.description || '',
                status: data.status || 'ACTIVE',
                organizationId: orgId,
                createdById: req.user.id,
            },
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'project.create',
                meta: { projectId: project.id },
            },
        });
        res.status(201).json((0, response_1.success)(project, 'Project created successfully'));
    }
    catch (err) {
        console.error('Project creation error:', err);
        res
            .status(400)
            .json((0, response_1.fail)(err instanceof Error ? err.message : 'Invalid input'));
    }
});
// GET /api/projects → Get all projects for org
router.get('/', async (req, res) => {
    try {
        const orgId = getOrganizationId(req);
        if (!orgId)
            return res.status(400).json((0, response_1.fail)('Organization ID missing'));
        const projects = await prisma_1.prisma.project.findMany({
            where: { organizationId: orgId },
            orderBy: { createdAt: 'desc' },
        });
        res.json((0, response_1.success)(projects));
    }
    catch (err) {
        console.error('Project fetch error:', err);
        res.status(500).json((0, response_1.fail)('Failed to fetch projects'));
    }
});
// GET /api/projects/:id → Get project by ID
router.get('/:id', async (req, res) => {
    try {
        const orgId = getOrganizationId(req);
        if (!orgId)
            return res.status(400).json((0, response_1.fail)('Organization ID missing'));
        const id = req.params.id;
        const project = await prisma_1.prisma.project.findUnique({ where: { id } });
        if (!project || project.organizationId !== orgId)
            return res.status(404).json((0, response_1.fail)('Project not found'));
        res.json((0, response_1.success)(project));
    }
    catch (err) {
        console.error('Project get error:', err);
        res.status(500).json((0, response_1.fail)('Failed to fetch project'));
    }
});
// PUT /api/projects/:id → Update project
router.put('/:id', async (req, res) => {
    try {
        const orgId = getOrganizationId(req);
        if (!orgId)
            return res.status(400).json((0, response_1.fail)('Organization ID missing'));
        const id = req.params.id;
        const project = await prisma_1.prisma.project.findUnique({ where: { id } });
        if (!project || project.organizationId !== orgId)
            return res.status(404).json((0, response_1.fail)('Project not found'));
        const data = updateSchema.parse(req.body);
        const updated = await prisma_1.prisma.project.update({
            where: { id },
            data,
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'project.update',
                meta: { projectId: id, changes: data },
            },
        });
        res.json((0, response_1.success)(updated, 'Project updated successfully'));
    }
    catch (err) {
        console.error('Project update error:', err);
        res
            .status(400)
            .json((0, response_1.fail)(err instanceof Error ? err.message : 'Invalid input'));
    }
});
// DELETE /api/projects/:id → Delete project
router.delete('/:id', async (req, res) => {
    try {
        const orgId = getOrganizationId(req);
        if (!orgId)
            return res.status(400).json((0, response_1.fail)('Organization ID missing'));
        const id = req.params.id;
        const project = await prisma_1.prisma.project.findUnique({ where: { id } });
        if (!project || project.organizationId !== orgId)
            return res.status(404).json((0, response_1.fail)('Project not found'));
        await prisma_1.prisma.project.delete({ where: { id } });
        await prisma_1.prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'project.delete',
                meta: { projectId: id },
            },
        });
        res.json((0, response_1.success)(null, 'Project deleted successfully'));
    }
    catch (err) {
        console.error('Project delete error:', err);
        res.status(500).json((0, response_1.fail)('Failed to delete project'));
    }
});
exports.default = router;
