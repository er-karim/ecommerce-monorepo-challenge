import "dotenv/config";
import { app } from "./server";

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Inventory service listening on port ${port}`);
});
