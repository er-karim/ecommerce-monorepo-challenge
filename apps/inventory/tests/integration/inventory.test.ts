import request from "supertest";
import { Application } from "express";
import { createApp } from "../../src/app";
import { InventoryRepository } from "../../src/repositories/inventory.repository";
import { InventoryService } from "../../src/services/inventory.service";
import { InventoryController } from "../../src/controllers/inventory.controller";

jest.mock("../../src/repositories/inventory.repository");

describe("Inventory API Integration", () => {
  let app: Application;
  let mockRepository: jest.Mocked<InventoryRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      updateInventory: jest.fn(),
    } as jest.Mocked<InventoryRepository>;

    const service = new InventoryService(mockRepository);
    const controller = new InventoryController(service);
    app = createApp(controller);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /inventory/:productId", () => {
    it("should return product details when found", async () => {
      const mockProduct = {
        id: "test-id",
        name: "Test Product",
        inventoryCount: 10,
      };

      mockRepository.findById.mockResolvedValue(mockProduct);

      const response = await request(app).get("/inventory/test-id").expect(200);

      expect(response.body).toEqual(mockProduct);
      expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
    });

    it("should return 404 when product not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await request(app)
        .get("/inventory/nonexistent")
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toContain("Product not found");
          expect(res.body.status).toBe(404);
        });
    });
  });

  describe("POST /inventory/:productId/purchase", () => {
    it("should successfully process purchase", async () => {
      const mockProduct = {
        id: "test-id",
        name: "Test Product",
        inventoryCount: 10,
      };

      mockRepository.findById.mockResolvedValue(mockProduct);
      mockRepository.updateInventory.mockResolvedValue();

      await request(app)
        .post("/inventory/test-id/purchase")
        .send({ quantity: 5 })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe("Inventory updated successfully");
        });

      expect(mockRepository.updateInventory).toHaveBeenCalledWith("test-id", 5);
    });

    it("should reject invalid quantity values", async () => {
      await request(app)
        .post("/inventory/test-id/purchase")
        .send({ quantity: -1 })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toContain("Invalid quantity");
          expect(res.body.status).toBe(400);
        });
    });

    it("should handle insufficient inventory", async () => {
      const mockProduct = {
        id: "test-id",
        name: "Test Product",
        inventoryCount: 3,
      };

      mockRepository.findById.mockResolvedValue(mockProduct);

      await request(app)
        .post("/inventory/test-id/purchase")
        .send({ quantity: 5 })
        .expect(409)
        .expect((res) => {
          expect(res.body.error).toContain("Insufficient inventory");
          expect(res.body.status).toBe(409);
        });

      expect(mockRepository.updateInventory).not.toHaveBeenCalled();
    });

    it("should handle unexpected errors during purchase processing", async () => {
      const mockProduct = {
        id: "test-id",
        name: "Test Product",
        inventoryCount: 10,
      };

      mockRepository.findById.mockResolvedValue(mockProduct);
      mockRepository.updateInventory.mockRejectedValue(
        new Error("Unexpected database error")
      );

      await request(app)
        .post("/inventory/test-id/purchase")
        .send({ quantity: 5 })
        .expect(500)
        .expect((res) => {
          expect(res.body.error).toBe(
            "An unexpected error occurred while processing your request"
          );
          expect(res.body.status).toBe(500);
        });

      expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
      expect(mockRepository.updateInventory).toHaveBeenCalled();
    });
  });
});
