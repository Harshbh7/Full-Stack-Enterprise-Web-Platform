import { Model, Document, FilterQuery, UpdateQuery, Types } from 'mongoose';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/errors.util.js';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export abstract class BaseRepository<T extends Document> {
  protected readonly model: Model<T>;
  protected readonly isTenantScoped: boolean;

  constructor(model: Model<T>, isTenantScoped = true) {
    this.model = model;
    this.isTenantScoped = isTenantScoped;
  }

  /**
   * Automatically enriches database filter with strict tenant isolation boundary.
   */
  protected applyTenantFilter(
    filter: FilterQuery<T>,
    tenantId?: string,
    isSuperAdmin = false
  ): FilterQuery<T> {
    if (!this.isTenantScoped) {
      return filter;
    }

    // Super Admins operate globally if no specific tenant is scoped
    if (isSuperAdmin && !tenantId) {
      return filter;
    }

    if (!tenantId) {
      throw new ForbiddenError(
        'Tenant context is strictly required for this data operation',
        'TENANT_ISOLATION_VIOLATION'
      );
    }

    const tenantObjectId = Types.ObjectId.isValid(tenantId)
      ? new Types.ObjectId(tenantId)
      : tenantId;

    return {
      ...filter,
      tenantId: tenantObjectId,
    };
  }

  async findById(
    id: string,
    tenantId?: string,
    isSuperAdmin = false,
    populateFields?: string | string[]
  ): Promise<T | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const filter = this.applyTenantFilter({ _id: new Types.ObjectId(id) } as FilterQuery<T>, tenantId, isSuperAdmin);
    let query = this.model.findOne(filter);

    if (populateFields) {
      if (Array.isArray(populateFields)) {
        populateFields.forEach((field) => {
          query = query.populate(field) as any;
        });
      } else {
        query = query.populate(populateFields) as any;
      }
    }

    return query.exec();
  }

  async findOne(
    filter: FilterQuery<T>,
    tenantId?: string,
    isSuperAdmin = false,
    populateFields?: string | string[]
  ): Promise<T | null> {
    const scopedFilter = this.applyTenantFilter(filter, tenantId, isSuperAdmin);
    let query = this.model.findOne(scopedFilter);

    if (populateFields) {
      if (Array.isArray(populateFields)) {
        populateFields.forEach((field) => {
          query = query.populate(field) as any;
        });
      } else {
        query = query.populate(populateFields) as any;
      }
    }

    return query.exec();
  }

  async findPaginated(
    filter: FilterQuery<T>,
    tenantId: string | undefined,
    isSuperAdmin: boolean,
    options: PaginationOptions,
    populateFields?: string | string[]
  ): Promise<PaginatedResult<T>> {
    const scopedFilter = this.applyTenantFilter(filter, tenantId, isSuperAdmin);
    const sortField = options.sortBy || 'createdAt';
    const sortDirection = options.sortOrder === 'asc' ? 1 : -1;

    let query = this.model
      .find(scopedFilter)
      .sort({ [sortField]: sortDirection })
      .skip(options.skip)
      .limit(options.limit);

    if (populateFields) {
      if (Array.isArray(populateFields)) {
        populateFields.forEach((field) => {
          query = query.populate(field) as any;
        });
      } else {
        query = query.populate(populateFields) as any;
      }
    }

    const [items, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(scopedFilter).exec(),
    ]);

    const totalPages = Math.ceil(total / options.limit) || 1;

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages,
      hasNext: options.page < totalPages,
      hasPrev: options.page > 1,
    };
  }

  async create(doc: Partial<T>): Promise<T> {
    return this.model.create(doc as any);
  }

  async update(
    id: string,
    update: UpdateQuery<T>,
    tenantId?: string,
    isSuperAdmin = false
  ): Promise<T | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const filter = this.applyTenantFilter({ _id: new Types.ObjectId(id) } as FilterQuery<T>, tenantId, isSuperAdmin);
    return this.model.findOneAndUpdate(filter, update, { new: true }).exec();
  }

  async delete(
    id: string,
    tenantId?: string,
    isSuperAdmin = false
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const filter = this.applyTenantFilter({ _id: new Types.ObjectId(id) } as FilterQuery<T>, tenantId, isSuperAdmin);
    const res = await this.model.deleteOne(filter).exec();
    return res.deletedCount > 0;
  }

  async count(
    filter: FilterQuery<T> = {},
    tenantId?: string,
    isSuperAdmin = false
  ): Promise<number> {
    const scopedFilter = this.applyTenantFilter(filter, tenantId, isSuperAdmin);
    return this.model.countDocuments(scopedFilter).exec();
  }
}
