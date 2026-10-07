import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode = 200,
  meta?: ApiResponse['meta']
): Response => {
  const responsePayload: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(responsePayload);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Resource created successfully'
): Response => {
  return sendSuccess(res, data, message, 201);
};
