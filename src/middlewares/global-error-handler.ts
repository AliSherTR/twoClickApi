import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error for development
  if (process.env.NODE_ENV === "development") {
    console.error("ERROR 💥:", err);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // Handle specific Prisma errors
  if (err.code === "P2002") {
    // Prisma unique constraint violation
    return res.status(409).json({
      status: "fail",
      message: `Duplicate field value: ${err.meta?.target?.join(", ")}`,
    });
  }
  if (err.code === "P2025") {
    // Prisma record not found
    return res.status(404).json({
      status: "fail",
      message: "Resource not found",
    });
  }

  // Handle operational errors (trusted)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Handle programming or unknown errors
  console.error("ERROR 💥:", err);
  res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};
