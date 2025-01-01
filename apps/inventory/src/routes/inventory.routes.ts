import { Router } from "express";
import { InventoryController } from "../controllers/inventory.controller";
import { validateQuantity } from "../middlewares/validation.middleware";

export const createInventoryRouter = (
  controller: InventoryController
): Router => {
  const router = Router();

  router.get("/:productId", controller.getProduct);
  router.post(
    "/:productId/purchase",
    validateQuantity,
    controller.purchaseProduct
  );

  return router;
};
