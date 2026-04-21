// ─── Base ─────────────────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean; // operational = expected, safe to expose to client

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── 400 Bad Request ──────────────────────────────────────────────────────────

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400, "BAD_REQUEST");
  }
}

export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>;

  constructor(message = "Validation failed", fields?: Record<string, string>) {
    super(message, 400, "VALIDATION_ERROR");
    this.fields = fields;
  }
}

// ─── 401 Unauthorized ─────────────────────────────────────────────────────────

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

// ─── 403 Forbidden ───────────────────────────────────────────────────────────

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, "FORBIDDEN");
  }
}

// ─── 404 Not Found ────────────────────────────────────────────────────────────

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

// ─── 409 Conflict ────────────────────────────────────────────────────────────

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

// ─── 422 Unprocessable Entity ─────────────────────────────────────────────────

export class UnprocessableError extends AppError {
  constructor(message = "Unprocessable entity") {
    super(message, 422, "UNPROCESSABLE_ENTITY");
  }
}

// ─── 429 Too Many Requests ────────────────────────────────────────────────────

export class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

// ─── 500 Internal ────────────────────────────────────────────────────────────

export class InternalError extends AppError {
  constructor(message = "An unexpected error occurred") {
    // isOperational = false — do NOT expose internals to client
    super(message, 500, "INTERNAL_SERVER_ERROR", false);
  }
}