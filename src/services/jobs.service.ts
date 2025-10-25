import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../../middleware/auth';
import { enqueueRecompute } from './jobs.service';
import { prisma } from '../libs/prisma';
import { success, fail } from '../utils/response';

const router = Router();
router.use(authMiddleware);

// trigger recompute metrics for the user's organization
router.post('/recompute-metrics', async (req: AuthRequest, res) => {
  try {
    const job = await enqueueRecompute(req.user!.organizationId);
    res.status(202).json(success({ jobId: job.id }, 'Job enqueued'));
  } catch (err) {
    res.status(500).json(fail('Failed to enqueue job'));
  }
});

// get job status
router.get('/:id', async (req: AuthRequest, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id }});
  if (!job) return res.status(404).json(fail('Job not found'));
  res.json(success(job));
});

export default router;
