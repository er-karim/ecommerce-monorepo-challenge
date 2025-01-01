import { Request, Response, NextFunction } from "express";
import { InventoryService } from "../services/inventory.service";
import {
  InsufficientInventoryError,
  ProductNotFoundError,
} from "../utils/errors";

export class InventoryController {
  constructor(private service: InventoryService) {}

  getProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const product = await this.service.getProduct(req.params.productId);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  purchaseProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.service.purchaseProduct(
        req.params.productId,
        Number(req.body.quantity)
      );
      res.status(200).json({ message: "Inventory updated successfully" });
    } catch (error) {
      if (
        error instanceof ProductNotFoundError ||
        error instanceof InsufficientInventoryError
      ) {
        next(error);
      } else {
        next(new Error("Failed to process purchase request"));
      }
    }
  };
}
