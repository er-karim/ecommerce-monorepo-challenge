import { InventoryRepository } from "../repositories/inventory.repository";
import {
  ProductNotFoundError,
  InsufficientInventoryError,
} from "../utils/errors";
import { Product } from "../models/inventory";

export class InventoryService {
  constructor(private repository: InventoryRepository) {}

  async getProduct(productId: string): Promise<Product> {
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new ProductNotFoundError(productId);
    }
    return product;
  }

  async purchaseProduct(productId: string, quantity: number): Promise<void> {
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new ProductNotFoundError(productId);
    }
    if (product.inventoryCount < quantity) {
      throw new InsufficientInventoryError(
        productId,
        quantity,
        product.inventoryCount
      );
    }
    await this.repository.updateInventory(
      productId,
      product.inventoryCount - quantity
    );
  }
}
