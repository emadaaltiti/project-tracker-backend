import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../../src/middleware/auth';
import { prisma } from '../../src/libs/prisma';
import { success } from '../../src/utils/response';

const router = Router();
router.use(authMiddleware);

router.get('/me', async (req: AuthRequest, res) => {
  const org = await prisma.organization.findUnique({ where: { id: req.user!.organizationId }});
  res.json(success(org));
});

export default router;
