import { Request, Response, NextFunction } from "express";
import { InventoryService } from "../services/inventory.service";
import {
  InsufficientInventoryError,
  ProductNotFoundError,
} from "../utils/errors";

export class InventoryController {
  private static instance: InventoryController | undefined;
  private service: InventoryService;

  private constructor(service: InventoryService) {
    this.service = service;
  }

  public static getInstance(): InventoryController {
    if (!InventoryController.instance) {
      const service = InventoryService.getInstance();
      InventoryController.instance = new InventoryController(service);
    }
    return InventoryController.instance;
  }

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
