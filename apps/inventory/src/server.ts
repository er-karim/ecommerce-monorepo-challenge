import express, { Request, Response } from "express";
import { db } from "./db";
import { products } from "./db/schema";
import { eq } from "drizzle-orm";

export const app: express.Application = express();

app.get("/", (_req: Request, res: Response) => {
  res.send("Inventory Microservice is running!");
});

// GET /inventory/:productId
app.get(
  "/inventory/:productId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json({
        id: product.id,
        name: product.name,
        inventoryCount: product.inventoryCount,
      });
    } catch (error) {
      // Only log error in non-test environment
      if (process.env.NODE_ENV !== "test") {
        console.error(error);
      }
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
