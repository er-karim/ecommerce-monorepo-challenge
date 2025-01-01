import { pgTable, uuid, varchar, integer } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  inventoryCount: integer("inventory_count").notNull().default(0),
});
