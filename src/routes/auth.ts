import { Router } from 'express';
import { prisma } from '../libs/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } from '../config/env';
import { z } from 'zod';
import { success, fail } from '../utils/response';

const router = Router();

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  organizationName: z.string().min(1)
});

router.post('/signup', async (req, res) => {
  try {
    const parsed = signUpSchema.parse(req.body);
    // create organization + user atomically
    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing) return res.status(400).json(fail('Email already in use'));
    const org = await prisma.organization.create({ data: { name: parsed.organizationName }});
    const hash = await bcrypt.hash(parsed.password, BCRYPT_SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        passwordHash: hash,
        name: parsed.name,
        organizationId: org.id
      }
    });
    const token = jwt.sign({ sub: user.id, org: org.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json(success({ token, user: { id: user.id, email: user.email, organizationId: org.id } }, 'Signed up'));
  } catch (err) {
    return res.status(400).json(fail(err instanceof Error ? err.message : 'Invalid input'));
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email }});
    if (!user) return res.status(401).json(fail('Invalid credentials'));
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json(fail('Invalid credentials'));
    const token = jwt.sign({ sub: user.id, org: user.organizationId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json(success({ token, user: { id: user.id, email: user.email, organizationId: user.organizationId } }, 'Logged in'));
  } catch (err) {
    res.status(400).json(fail(err instanceof Error ? err.message : 'Invalid input'));
  }
});

export default router;
