import app from './app';
import { PORT } from './config/env';
import { prisma } from './libs/prisma';

const port = Number(PORT);

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  try {
    await prisma.$connect();
    console.log('Connected to database');
  } catch (err) {
    console.error('DB connection failed', err);
    process.exit(1);
  }
});
