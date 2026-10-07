export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly errors?: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    errors?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code = 'BAD_REQUEST', errors?: Array<{ field?: string; message: string }>) {
    super(message, 400, code, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class TenantIsolationError extends AppError {
  constructor(message = 'Cross-tenant resource access violation', code = 'TENANT_ISOLATION_ERROR') {
    super(message, 403, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists or conflict occurred', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class ValidationError extends AppError {
  constructor(errors: Array<{ field?: string; message: string }>, message = 'Input validation failed') {
    super(message, 422, 'VALIDATION_ERROR', errors);
  }
}
