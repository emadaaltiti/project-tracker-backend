"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueRecompute = enqueueRecompute;
const prisma_1 = require("../libs/prisma");
async function enqueueRecompute(orgId) {
    // create job record
    const job = await prisma_1.prisma.job.create({
        data: { type: 'recompute_metrics', payload: { orgId } }
    });
    // Simulate background worker via setTimeout.
    // In production you'd push to Redis / worker queue (BullMQ, Sidekiq, etc.)
    setTimeout(async () => {
        try {
            await prisma_1.prisma.job.update({ where: { id: job.id }, data: { status: 'RUNNING' } });
            // Example: recompute counts
            const total = await prisma_1.prisma.project.count({ where: { organizationId: orgId } });
            const active = await prisma_1.prisma.project.count({ where: { organizationId: orgId, status: 'ACTIVE' } });
            const completed = await prisma_1.prisma.project.count({ where: { organizationId: orgId, status: 'COMPLETED' } });
            const result = { total, active, completed, computedAt: new Date() };
            await prisma_1.prisma.job.update({ where: { id: job.id }, data: { status: 'COMPLETED', result } });
        }
        catch (e) {
            await prisma_1.prisma.job.update({ where: { id: job.id }, data: { status: 'FAILED', result: { error: String(e) } } });
        }
    }, 3000); // 3s delay to simulate work
    return job;
}
