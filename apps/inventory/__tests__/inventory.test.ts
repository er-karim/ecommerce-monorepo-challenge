import supertest from "supertest";
import { app } from "../src/server";
import { db } from "../src/db";
import { products } from "../src/db/schema";
import { eq } from "drizzle-orm";

// Mock the database module
jest.mock("../src/db", () => ({
  db: {
    transaction: jest.fn(),
    select: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    update: jest.fn(),
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

describe("POST /inventory/:productId/purchase", () => {
  const request = supertest(app);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("successful scenarios", () => {
    it("should update inventory when sufficient stock exists", async () => {
      const mockProduct = {
        id: "123",
        inventoryCount: 10,
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockWhere = jest.fn().mockResolvedValue([mockProduct]);
        const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
        const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
        const mockUpdateWhere = jest.fn().mockResolvedValue([]);
        const mockUpdateSet = jest
          .fn()
          .mockReturnValue({ where: mockUpdateWhere });
        const mockUpdate = jest.fn().mockReturnValue({ set: mockUpdateSet });

        const tx = {
          select: mockSelect,
          update: mockUpdate,
        };

        await callback(tx);
      });

      (db.transaction as jest.Mock).mockImplementation(mockTransaction);

      const response = await request
        .post("/inventory/123/purchase")
        .send({ quantity: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Inventory updated successfully",
      });
    });

    it("should accept string integer values for quantity", async () => {
      const mockProduct = {
        id: "123",
        inventoryCount: 10,
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockWhere = jest.fn().mockResolvedValue([mockProduct]);
        const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
        const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
        const mockUpdateWhere = jest.fn().mockResolvedValue([]);
        const mockUpdateSet = jest
          .fn()
          .mockReturnValue({ where: mockUpdateWhere });
        const mockUpdate = jest.fn().mockReturnValue({ set: mockUpdateSet });

        const tx = {
          select: mockSelect,
          update: mockUpdate,
        };

        await callback(tx);
      });

      (db.transaction as jest.Mock).mockImplementation(mockTransaction);

      const response = await request
        .post("/inventory/123/purchase")
        .send({ quantity: "5" });

      expect(response.status).toBe(200);
    });
  });

  describe("validation scenarios", () => {
    it("should reject negative quantities", async () => {
      const response = await request
        .post("/inventory/123/purchase")
        .send({ quantity: -1 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Invalid quantity. Must be a positive integer.",
      });
    });

    it("should reject zero quantities", async () => {
      const response = await request
        .post("/inventory/123/purchase")
        .send({ quantity: 0 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Invalid quantity. Must be a positive integer.",
      });
    });

    it("should reject non-integer quantities", async () => {
      const response = await request
        .post("/inventory/123/purchase")
        .send({ quantity: 1.5 });

      expect(response.status).toBe(400);
    });

    it("should reject non-numeric strings", async () => {
      const response = await request
        .post("/inventory/123/purchase")
        .send({ quantity: "abc" });

      expect(response.status).toBe(400);
    });
  });

  describe("error scenarios", () => {
    it("should return 404 when product is not found", async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockWhere = jest.fn().mockResolvedValue([]);
        const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
        const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

        const tx = {
          select: mockSelect,
        };

        await callback(tx);
      });

      (db.transaction as jest.Mock).mockImplementation(mockTransaction);

      const response = await request
        .post("/inventory/nonexistent/purchase")
        .send({ quantity: 1 });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Product not found" });
    });

    it("should return 409 when insufficient inventory", async () => {
      const mockProduct = {
        id: "123",
        inventoryCount: 5,
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockWhere = jest.fn().mockResolvedValue([mockProduct]);
        const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
        const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

        const tx = {
          select: mockSelect,
        };

        await callback(tx);
      });

      (db.transaction as jest.Mock).mockImplementation(mockTransaction);

      const response = await request
        .post("/inventory/123/purchase")
        .send({ quantity: 10 });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        error: "Insufficient inventory available",
      });
    });

    it("should return 500 when database transaction fails", async () => {
      const mockTransaction = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));
      (db.transaction as jest.Mock).mockImplementation(mockTransaction);

      const response = await request
        .post("/inventory/123/purchase")
        .send({ quantity: 1 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal Server Error" });
    });

    it("should return 500 when a non-Error object is thrown", async () => {
      const mockTransaction = jest.fn().mockImplementation(() => {
        throw "Unexpected error type"; // Throwing a string instead of Error object
      });
      (db.transaction as jest.Mock).mockImplementation(mockTransaction);

      const response = await request
        .post("/inventory/123/purchase")
        .send({ quantity: 1 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal Server Error" });
    });
  });
});
