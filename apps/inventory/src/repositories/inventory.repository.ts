import { db } from "../config/database";
import { products } from "../models/schema";
import { eq } from "drizzle-orm";
import { Product } from "../models/inventory";

export class InventoryRepository {
  private static instance: InventoryRepository | undefined;

  private constructor() {}

  public static getInstance(): InventoryRepository {
    if (!InventoryRepository.instance) {
      InventoryRepository.instance = new InventoryRepository();
    }
    return InventoryRepository.instance;
  }

  async findById(productId: string): Promise<Product | null> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));
    return product || null;
  }

  async updateInventory(productId: string, newCount: number): Promise<void> {
    await db
      .update(products)
      .set({ inventoryCount: newCount })
      .where(eq(products.id, productId));
  }
}
