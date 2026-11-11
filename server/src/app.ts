import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { errorHandler } from './middleware/errorHandler.js';

// Module routers
import authRoutes from './modules/auth/auth.routes.js';
import supplierRoutes from './modules/suppliers/suppliers.routes.js';
import importRoutes from './modules/imports/imports.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import entityRoutes from './modules/entities/entities.routes.js';
import matchingRoutes from './modules/matching/matching.routes.js';
import offerRoutes from './modules/offers/offers.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';

export const app: Application = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/v1/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (e: any) {
    dbStatus = `error: ${e.message}`;
  }

  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Sangam Express API Backend',
    version: '0.1.0',
    environment: env.NODE_ENV,
    database: dbStatus,
  });
});

// Mount API v1 modules
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/imports', importRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/entities', entityRoutes);
app.use('/api/v1/matching', matchingRoutes);
app.use('/api/v1/offers', offerRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
