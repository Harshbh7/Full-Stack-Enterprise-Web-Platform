import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { isOriginAllowed } from '../config/cors.js';
import { verifyAccessToken } from '../utils/jwt.util.js';
import { logger } from '../config/logger.js';
import { IJwtPayload } from '../types/index.js';

let ioInstance: SocketIOServer | null = null;

export interface AuthenticatedSocket extends Socket {
  user?: IJwtPayload;
}

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Origin not allowed by Socket.IO CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // Authentication Middleware for WebSocket Connections
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization;
      const token =
        socket.handshake.auth?.token ||
        (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);

      if (!token) {
        return next(new Error('Authentication token required for WebSocket connection'));
      }

      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch (err: any) {
      logger.warn(`WebSocket authentication failed: ${err.message}`);
      next(new Error(`Unauthorized: ${err.message}`));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.user;
    logger.info(`⚡ Authenticated WebSocket client connected: ${socket.id} (User: ${user?.email}, Role: ${user?.role})`);

    // Auto-join isolated tenant room
    if (user?.tenantId) {
      const tenantRoom = `tenant:${user.tenantId}`;
      socket.join(tenantRoom);
      logger.info(`Socket ${socket.id} joined ${tenantRoom}`);
    }

    // Auto-join personal user room for direct notifications
    if (user?.userId) {
      const userRoom = `user:${user.userId}`;
      socket.join(userRoom);
    }

    // Auto-join role room
    if (user?.role) {
      socket.join(`role:${user.role}`);
    }

    // Handle course room subscriptions
    socket.on('join:course', (courseId: string) => {
      if (courseId) {
        socket.join(`course:${courseId}`);
        logger.info(`Socket ${socket.id} joined course:${courseId}`);
      }
    });

    socket.on('leave:course', (courseId: string) => {
      if (courseId) {
        socket.leave(`course:${courseId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket client disconnected: ${socket.id} (${reason})`);
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = (): SocketIOServer => {
  if (!ioInstance) {
    throw new Error('Socket.IO server has not been initialized');
  }
  return ioInstance;
};

/**
 * Emit event strictly scoped to a tenant
 */
export const emitToTenant = (tenantId: string, event: string, data: any): void => {
  if (!ioInstance) return;
  ioInstance.to(`tenant:${tenantId}`).emit(event, data);
};

/**
 * Emit event to a specific user
 */
export const emitToUser = (userId: string, event: string, data: any): void => {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, data);
};
