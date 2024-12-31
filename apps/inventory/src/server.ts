import express, { Request, Response } from "express";
import { db } from "./db";
import { products } from "./db/schema";
import { eq } from "drizzle-orm";

export const app: express.Application = express();

// Middleware to parse JSON bodies
app.use(express.json());

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
      if (process.env.NODE_ENV !== "test") {
        console.error(error);
      }
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

interface UpdateInventoryRequest {
  quantity: number | string;
}

app.post(
  "/inventory/:productId/purchase",
  async (
    req: Request<{ productId: string }, {}, UpdateInventoryRequest>,
    res: Response
  ): Promise<void> => {
    try {
      const { productId } = req.params;
      const parsedQuantity = Number(req.body.quantity);

      if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
        res.status(400).json({
          error: "Invalid quantity. Must be a positive integer.",
        });
        return;
      }

      await db.transaction(async (tx) => {
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, productId));

        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        if (product.inventoryCount < parsedQuantity) {
          throw new Error("INSUFFICIENT_INVENTORY");
        }

        await tx
          .update(products)
          .set({
            inventoryCount: product.inventoryCount - parsedQuantity,
          })
          .where(eq(products.id, productId));
      });

      res.status(200).json({
        message: "Inventory updated successfully",
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error(error);
      }

      if (error instanceof Error) {
        switch (error.message) {
          case "PRODUCT_NOT_FOUND":
            res.status(404).json({ error: "Product not found" });
            break;
          case "INSUFFICIENT_INVENTORY":
            res.status(409).json({
              error: "Insufficient inventory available",
            });
            break;
          default:
            res.status(500).json({ error: "Internal Server Error" });
        }
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }
);
