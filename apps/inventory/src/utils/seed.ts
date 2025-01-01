import "dotenv/config";
import { faker } from "@faker-js/faker";
import { db } from "../config/database";
import { products } from "../models/schema";

async function seedProducts() {
  for (let i = 0; i < 10; i++) {
    const name = faker.commerce.productName();
    const inventoryCount = faker.number.int({ min: 0, max: 100 });

    await db.insert(products).values({
      name,
      inventoryCount,
    });
  }
}

seedProducts()
  .then(() => {
    console.log("Seed completed!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
