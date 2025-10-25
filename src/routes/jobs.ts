import { prisma } from '../libs/prisma';

export async function enqueueRecompute(orgId: string) {
  // create job record
  const job = await prisma.job.create({
    data: { type: 'recompute_metrics', payload: { orgId } }
  });

  // Simulate background worker via setTimeout.
  // In production you'd push to Redis / worker queue (BullMQ, Sidekiq, etc.)
  setTimeout(async () => {
    try {
      await prisma.job.update({ where: { id: job.id }, data: { status: 'RUNNING' }});
      // Example: recompute counts
      const total = await prisma.project.count({ where: { organizationId: orgId }});
      const active = await prisma.project.count({ where: { organizationId: orgId, status: 'ACTIVE' }});
      const completed = await prisma.project.count({ where: { organizationId: orgId, status: 'COMPLETED' }});
      const result = { total, active, completed, computedAt: new Date() };
      await prisma.job.update({ where: { id: job.id }, data: { status: 'COMPLETED', result }});
    } catch (e) {
      await prisma.job.update({ where: { id: job.id }, data: { status: 'FAILED', result: { error: String(e) } }});
    }
  }, 3000); // 3s delay to simulate work

  return job;
}
