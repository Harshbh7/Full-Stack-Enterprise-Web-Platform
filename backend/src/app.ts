import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { resolveTenant } from './middleware/tenant.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import v1Routes from './routes/v1/index.js';

export const createApp = (): Application => {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    })
  );

  // HTTP Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Response Compression & Parsers
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Global Tenant Context Resolver
  app.use(resolveTenant);

  // API Version 1 Mount
  app.use(env.API_PREFIX, v1Routes);

  // Fallback 404 & Centralized Error Handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
