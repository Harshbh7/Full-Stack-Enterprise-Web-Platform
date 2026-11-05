import { describe, it, expect } from 'vitest';
import { getPaginationParams, buildPaginationMeta } from '../../src/utils/pagination.util.js';
import { Request } from 'express';

describe('Pagination Utility Unit Tests', () => {
  it('PAG-01: calculates default pagination parameters accurately', () => {
    const mockReq = { query: {} } as Request;
    const params = getPaginationParams(mockReq);

    expect(params.page).toBe(1);
    expect(params.limit).toBe(20);
    expect(params.skip).toBe(0);
    expect(params.sortBy).toBe('createdAt');
    expect(params.sortOrder).toBe('desc');
  });

  it('PAG-02: respects custom page and limit query inputs', () => {
    const mockReq = {
      query: { page: '3', limit: '15', sortBy: 'title', sortOrder: 'asc' },
    } as unknown as Request;

    const params = getPaginationParams(mockReq);

    expect(params.page).toBe(3);
    expect(params.limit).toBe(15);
    expect(params.skip).toBe(30); // (3 - 1) * 15
    expect(params.sortBy).toBe('title');
    expect(params.sortOrder).toBe('asc');
  });

  it('PAG-03: enforces maxLimit cap to prevent memory exhaustion', () => {
    const mockReq = {
      query: { limit: '500' },
    } as unknown as Request;

    const params = getPaginationParams(mockReq, 20, 100);
    expect(params.limit).toBe(100);
  });

  it('PAG-04: clamps invalid negative page values to 1 and falls back to default limit on 0', () => {
    const mockReq = {
      query: { page: '-5', limit: '0' },
    } as unknown as Request;

    const params = getPaginationParams(mockReq);
    expect(params.page).toBe(1);
    expect(params.limit).toBe(20);
  });

  it('PAG-05: correctly builds pagination metadata with hasNext and hasPrev flags', () => {
    const metaPage1 = buildPaginationMeta(45, 1, 10);
    expect(metaPage1.total).toBe(45);
    expect(metaPage1.totalPages).toBe(5);
    expect(metaPage1.hasNext).toBe(true);
    expect(metaPage1.hasPrev).toBe(false);

    const metaPage3 = buildPaginationMeta(45, 3, 10);
    expect(metaPage3.hasNext).toBe(true);
    expect(metaPage3.hasPrev).toBe(true);

    const metaPage5 = buildPaginationMeta(45, 5, 10);
    expect(metaPage5.hasNext).toBe(false);
    expect(metaPage5.hasPrev).toBe(true);
  });
});
