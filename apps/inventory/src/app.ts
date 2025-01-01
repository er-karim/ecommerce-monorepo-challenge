import express, { Application } from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware";
import { createInventoryRouter } from "./routes/inventory.routes";
import { InventoryController } from "./controllers/inventory.controller";

export function createApp(controller: InventoryController): Application {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
    })
  );

  app.use(express.json());
  app.use("/inventory", createInventoryRouter(controller));
  app.use(errorHandler);

  return app;
}
