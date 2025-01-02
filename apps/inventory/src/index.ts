import "dotenv/config";
import { createApp } from "./app";
import { InventoryController } from "./controllers/inventory.controller";

const controller = InventoryController.getInstance();

const app = createApp(controller);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
