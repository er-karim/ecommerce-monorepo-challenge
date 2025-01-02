import { Request, Response, NextFunction } from "express";
import { InputSanitizer } from "../utils/sanitization";
import { ValidationError } from "./validation.middleware";

export const sanitizeInventoryInputs = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    // Sanitize path parameters
    if (req.params.productId) {
      req.params.productId = InputSanitizer.sanitizeUUID(req.params.productId);
    }

    // Sanitize request body
    if (req.body) {
      if (req.body.quantity !== undefined) {
        const sanitizedQuantity = InputSanitizer.sanitizeQuantity(
          req.body.quantity
        );
        if (sanitizedQuantity === 0) {
          throw new ValidationError("Quantity must be a valid number");
        }
        req.body.quantity = sanitizedQuantity;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
