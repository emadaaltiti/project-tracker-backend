import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../libs/prisma';
import { success } from '../utils/response';

const router = Router();
router.use(authMiddleware);

router.get('/me', async (req: AuthRequest, res) => {
  const org = await prisma.organization.findUnique({ where: { id: req.user!.organizationId }});
  res.json(success(org));
});

export default router;
