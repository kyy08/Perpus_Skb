import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from '../config/env.js';
import { uploadDirectory } from '../config/uploads.js';
import { errorHandler, notFoundHandler } from '../middleware/error-handler.js';
import { createRoutes } from './routes.js';

export function createApp(container) {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', (request, response, next) => {
    response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, express.static(uploadDirectory));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/', (request, response) => {
    response.json({
      success: true,
      name: 'Perpus SKB Kota Tegal API',
      version: 'v1'
    });
  });

  app.use('/api', createRoutes(container));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
