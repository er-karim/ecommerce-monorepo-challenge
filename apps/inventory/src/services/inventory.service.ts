import { InventoryRepository } from "../repositories/inventory.repository";
import {
  ProductNotFoundError,
  InsufficientInventoryError,
} from "../utils/errors";
import { Product } from "../models/inventory";

export class InventoryService {
  private static instance: InventoryService | undefined;
  private repository: InventoryRepository;

  private constructor(repository: InventoryRepository) {
    this.repository = repository;
  }

  public static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      const repository = InventoryRepository.getInstance();
      InventoryService.instance = new InventoryService(repository);
    }
    return InventoryService.instance;
  }

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
