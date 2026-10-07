import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: true,
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection runtime error: ${err.message}`);
});
