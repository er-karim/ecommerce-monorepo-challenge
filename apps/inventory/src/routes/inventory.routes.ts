import { Router } from "express";
import { InventoryController } from "../controllers/inventory.controller";
import { validateQuantity } from "../middlewares/validation.middleware";
import { sanitizeInventoryInputs } from "../middlewares/sanitization.middleware";

export const createInventoryRouter = (
  controller: InventoryController
): Router => {
  const router = Router();

  router.get("/:productId", sanitizeInventoryInputs, controller.getProduct);

  router.post(
    "/:productId/purchase",
    validateQuantity,
    sanitizeInventoryInputs,
    controller.purchaseProduct
  );

  return router;
};
