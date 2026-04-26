import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { AppError } from "./errors";
import { UnauthorizedError } from "./errors";

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

export type AuthenticatedRequest = Request & {
  user?: string | JwtPayload;
};

export const verifyToken = catchErrors(
  (req: Request, _res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedError("Missing authorization header");
    }

    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedError("Invalid authorization header format");
    }

    if (!process.env.JWT_SECRET) {
      throw new UnauthorizedError("JWT secret is not configured");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      (req as AuthenticatedRequest).user = decoded;

      if (typeof decoded === "object" && decoded.sub) {
        req.headers["x-user-id"] = String(decoded.sub);
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedError("Token has expired");
      }

      throw new UnauthorizedError("Invalid token");
    }

    next();
  },
);
