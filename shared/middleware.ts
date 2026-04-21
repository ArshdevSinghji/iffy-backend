import { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError } from "./errors";

// ─── catchErrors ──────────────────────────────────────────────────────────────
// Wraps async route handlers so you never need try/catch in a handler

export const catchErrors = (handler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Mount this LAST in app.ts:  app.use(globalErrorHandler)

export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Known, operational error — safe to expose to client
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
      // Only attach fields if it's a ValidationError
      ...("fields" in error && { fields: error.fields }),
    });
    return;
  }

  // Unknown/programmer error — never expose internals
  console.error("[Unhandled Error]", error);

  res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
};
