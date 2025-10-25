// src/app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/auth';
import projectsRoutes from './routes/projects';
import orgRoutes from './routes/orgs';

// Middleware
import { errorHandler } from './middleware/errorHandler';

const app = express();

// -------------------- MIDDLEWARE -------------------- //
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic rate-limiting: max 200 requests per minute per IP
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// -------------------- ROUTES -------------------- //
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/orgs', orgRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// -------------------- ERROR HANDLER -------------------- //
app.use(errorHandler);

export default app;
