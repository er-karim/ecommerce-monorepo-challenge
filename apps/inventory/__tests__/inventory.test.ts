import supertest from "supertest";
import { app } from "../src/server";
import { db } from "../src/db";
import { products } from "../src/db/schema";
import { eq } from "drizzle-orm";

// Mock the database module
jest.mock("../src/db", () => ({
  db: {
    select: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
  },
}));

describe("GET /inventory/:productId", () => {
  const request = supertest(app);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("successful scenarios", () => {
    it("should return product details when product exists", async () => {
      const mockProduct = {
        id: "123",
        name: "Test Product",
        inventoryCount: 10,
      };

      const mockWhere = jest.fn().mockResolvedValue([mockProduct]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const response = await request.get("/inventory/123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: mockProduct.id,
        name: mockProduct.name,
        inventoryCount: mockProduct.inventoryCount,
      });
      expect(mockWhere).toHaveBeenCalledWith(eq(products.id, "123"));
    });

    it("should return stripped down product object without internal fields", async () => {
      const mockProduct = {
        id: "123",
        name: "Test Product",
        inventoryCount: 10,
      };

      const mockWhere = jest.fn().mockResolvedValue([mockProduct]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const response = await request.get("/inventory/123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: mockProduct.id,
        name: mockProduct.name,
        inventoryCount: mockProduct.inventoryCount,
      });
      expect(response.body).not.toHaveProperty("createdAt");
      expect(response.body).not.toHaveProperty("updatedAt");
      expect(response.body).not.toHaveProperty("internalField");
    });
  });

  describe("error scenarios", () => {
    it("should return 404 when product is not found", async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const response = await request.get("/inventory/nonexistent");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Product not found" });
    });

    it("should return 500 when database query fails", async () => {
      const mockWhere = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const response = await request.get("/inventory/123");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal Server Error" });
    });
  });

  describe("input validation", () => {
    it("should handle special characters in productId", async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const response = await request.get("/inventory/@#$%^&*");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Product not found" });
    });
  });
});
