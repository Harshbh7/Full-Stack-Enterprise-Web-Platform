import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { IJwtPayload } from '../types/index.js';

export const generateAccessToken = (payload: Omit<IJwtPayload, 'iat' | 'exp'>): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: Omit<IJwtPayload, 'iat' | 'exp'>): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): IJwtPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as IJwtPayload;
};

export const verifyRefreshToken = (token: string): IJwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as IJwtPayload;
};
