import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

export const errorHandler = (
  error: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (process.env.NODE_ENV !== "test") {
    console.error("Error occurred:", error);
  }

  // Check if error is an instance of our custom errors
  if (error.name === "ProductNotFoundError") {
    res.status(404).json({
      error: error.message,
      status: 404,
    });
    return;
  }

  if (error.name === "InsufficientInventoryError") {
    res.status(409).json({
      error: error.message,
      status: 409,
    });
    return;
  }

  // Handle any other AppError instances
  if ("statusCode" in error) {
    res.status(error.statusCode).json({
      error: error.message,
      status: error.statusCode,
    });
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    error: "An unexpected error occurred while processing your request",
    status: 500,
  });
};
