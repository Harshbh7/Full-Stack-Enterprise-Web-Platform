import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { redis } from './config/redis.js';
import { logger } from './config/logger.js';

const startServer = async () => {
  // Connect to persistent MongoDB
  await connectDatabase();

  const app = createApp();
  const httpServer = http.createServer(app);

  // Setup Socket.IO Server with CORS
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  const server = httpServer.listen(env.PORT, () => {
    logger.info(`🚀 EduSphere Backend Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`📡 API endpoint: http://localhost:${env.PORT}${env.API_PREFIX}`);
    logger.info(`🩺 Health endpoint: http://localhost:${env.PORT}${env.API_PREFIX}/healthz`);
  });

  // Graceful Shutdown
  const handleShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      await redis.quit();
      logger.info('Redis connection closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((err) => {
  logger.error(`Fatal server error on boot: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
