import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
    this.name = "ValidationError";
  }
}

export const validateQuantity = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const quantity = req.body.quantity;

    // Handle missing or empty values
    if (quantity === undefined || quantity === "") {
      throw new ValidationError("Quantity must be a valid number");
    }

    const parsedQuantity = Number(quantity);

    // Handle non-numeric values
    if (Number.isNaN(parsedQuantity)) {
      throw new ValidationError("Quantity must be a valid number");
    }

    // Handle decimal values (including string representations)
    if (!Number.isInteger(parsedQuantity) || String(quantity).includes(".")) {
      throw new ValidationError("Quantity must be an integer value");
    }

    // Handle non-positive values
    if (parsedQuantity <= 0) {
      throw new ValidationError("Quantity must be a positive integer");
    }

    req.body.quantity = parsedQuantity;
    next();
  } catch (error) {
    next(error);
  }
};
