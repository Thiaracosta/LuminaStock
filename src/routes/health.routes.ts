import { Router } from 'express';
import { prisma } from '../prisma';

export const healthRoutes = Router();

healthRoutes.get('/', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: (error as Error).message,
    });
  }
});