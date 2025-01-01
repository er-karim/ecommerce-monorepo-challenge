import express, { Application } from "express";
import { errorHandler } from "./middlewares/error.middleware";
import { createInventoryRouter } from "./routes/inventory.routes";
import { InventoryController } from "./controllers/inventory.controller";

export function createApp(controller: InventoryController): Application {
  const app = express();
  app.use(express.json());

  app.use("/inventory", createInventoryRouter(controller));
  app.use(errorHandler);

  return app;
}
