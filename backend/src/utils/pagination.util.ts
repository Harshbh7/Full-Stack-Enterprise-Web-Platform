import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const getPaginationParams = (req: Request, defaultLimit = 20, maxLimit = 100): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const rawLimit = parseInt(req.query.limit as string, 10) || defaultLimit;
  const limit = Math.min(Math.max(1, rawLimit), maxLimit);
  const skip = (page - 1) * limit;

  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

export const buildPaginationMeta = (total: number, page: number, limit: number) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
