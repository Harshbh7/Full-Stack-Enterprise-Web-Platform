import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { resolveTenant } from './middleware/tenant.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import v1Routes from './routes/v1/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createApp = (): Application => {
  const app = express();

  // Security Headers (relaxed slightly for swagger-ui assets)
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  // Dynamic CORS Configuration
  app.use(cors(corsOptions));

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

  // OpenAPI / Swagger Documentation
  try {
    const swaggerDocPath = join(__dirname, 'docs', 'openapi.json');
    const swaggerDocument = JSON.parse(readFileSync(swaggerDocPath, 'utf8'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (err: any) {
    console.warn('Swagger documentation not loaded:', err.message);
  }

  // API Version 1 Mount
  app.use(env.API_PREFIX, v1Routes);

  // Fallback 404 & Centralized Error Handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
