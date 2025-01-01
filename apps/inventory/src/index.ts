import "dotenv/config";
import { createApp } from "./app";
import { InventoryRepository } from "./repositories/inventory.repository";
import { InventoryService } from "./services/inventory.service";
import { InventoryController } from "./controllers/inventory.controller";

const repository = new InventoryRepository();
const service = new InventoryService(repository);
const controller = new InventoryController(service);

const app = createApp(controller);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
