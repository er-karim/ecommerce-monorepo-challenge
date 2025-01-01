import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export const validateQuantity = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const parsedQuantity = Number(req.body.quantity);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    next(new ValidationError("Invalid quantity. Must be a positive integer."));
    return;
  }

  req.body.quantity = parsedQuantity;
  next();
};
