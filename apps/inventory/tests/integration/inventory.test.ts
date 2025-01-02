import request from "supertest";
import { Application } from "express";
import { createApp } from "../../src/app";
import { InventoryRepository } from "../../src/repositories/inventory.repository";
import { InventoryService } from "../../src/services/inventory.service";
import { InventoryController } from "../../src/controllers/inventory.controller";

describe("Inventory API Integration Tests", () => {
  let app: Application;
  let mockRepository: jest.Mocked<InventoryRepository>;

  beforeEach(() => {
    // Reset all singleton instances
    InventoryRepository["instance"] = undefined;
    InventoryService["instance"] = undefined;
    InventoryController["instance"] = undefined;

    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      updateInventory: jest.fn(),
    } as jest.Mocked<InventoryRepository>;

    // Setup repository mock
    jest
      .spyOn(InventoryRepository, "getInstance")
      .mockReturnValue(mockRepository);

    // Create application with singleton controller
    app = createApp(InventoryController.getInstance());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Clean up singleton instances
    InventoryRepository["instance"] = undefined;
    InventoryService["instance"] = undefined;
    InventoryController["instance"] = undefined;
    jest.restoreAllMocks();
  });

  describe("GET /inventory/:productId", () => {
    const mockProduct = {
      id: "test-id",
      name: "Test Product",
      inventoryCount: 10,
    };

    it("should successfully return product details when found", async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);

      const response = await request(app).get("/inventory/test-id").expect(200);

      expect(response.body).toEqual(mockProduct);
      expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should return 404 when product is not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .get("/inventory/nonexistent")
        .expect(404);

      expect(response.body).toEqual({
        error: expect.stringContaining("Product not found"),
        status: 404,
      });
      expect(mockRepository.findById).toHaveBeenCalledWith("nonexistent");
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /inventory/:productId/purchase", () => {
    const mockProduct = {
      id: "test-id",
      name: "Test Product",
      inventoryCount: 10,
    };

    describe("successful purchases", () => {
      beforeEach(() => {
        mockRepository.findById.mockResolvedValue(mockProduct);
        mockRepository.updateInventory.mockResolvedValue();
      });

      it("should successfully process a valid purchase request", async () => {
        const response = await request(app)
          .post("/inventory/test-id/purchase")
          .send({ quantity: 5 })
          .expect(200);

        expect(response.body).toEqual({
          message: "Inventory updated successfully",
        });
        expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
        expect(mockRepository.updateInventory).toHaveBeenCalledWith(
          "test-id",
          5
        );
      });
    });

    describe("validation failures", () => {
      const testCases = [
        {
          scenario: "missing quantity",
          payload: {},
          expectedMessage: "Quantity must be a valid number",
        },
        {
          scenario: "empty quantity",
          payload: { quantity: "" },
          expectedMessage: "Quantity must be a valid number",
        },
        {
          scenario: "non-numeric quantity",
          payload: { quantity: "abc" },
          expectedMessage: "Quantity must be a valid number",
        },
        {
          scenario: "decimal quantity",
          payload: { quantity: 1.5 },
          expectedMessage: "Quantity must be an integer value",
        },
        {
          scenario: "zero quantity",
          payload: { quantity: 0 },
          expectedMessage: "Quantity must be a positive integer",
        },
        {
          scenario: "negative quantity",
          payload: { quantity: -1 },
          expectedMessage: "Quantity must be a positive integer",
        },
        {
          scenario: "string decimal quantity",
          payload: { quantity: "1.5" },
          expectedMessage: "Quantity must be an integer value",
        },
        {
          scenario: "special characters",
          payload: { quantity: "1@#$%" },
          expectedMessage: "Quantity must be a valid number",
        },
      ];

      beforeEach(() => {
        mockRepository.findById.mockReset();
        mockRepository.updateInventory.mockReset();
      });

      testCases.forEach(({ scenario, payload, expectedMessage }) => {
        it(`should reject purchase with ${scenario}`, async () => {
          const response = await request(app)
            .post("/inventory/test-id/purchase")
            .send(payload);

          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: expectedMessage,
            status: 400,
          });

          expect(mockRepository.findById).not.toHaveBeenCalled();
          expect(mockRepository.updateInventory).not.toHaveBeenCalled();
        });
      });
    });

    describe("business rule failures", () => {
      it("should handle insufficient inventory", async () => {
        const lowStockProduct = { ...mockProduct, inventoryCount: 3 };
        mockRepository.findById.mockResolvedValue(lowStockProduct);

        const response = await request(app)
          .post("/inventory/test-id/purchase")
          .send({ quantity: 5 })
          .expect(409);

        expect(response.body).toEqual({
          error: expect.stringContaining("Insufficient inventory"),
          status: 409,
        });
        expect(mockRepository.updateInventory).not.toHaveBeenCalled();
      });

      it("should handle non-existent product", async () => {
        mockRepository.findById.mockResolvedValue(null);

        const response = await request(app)
          .post("/inventory/test-id/purchase")
          .send({ quantity: 5 })
          .expect(404);

        expect(response.body).toEqual({
          error: expect.stringContaining("Product not found"),
          status: 404,
        });
        expect(mockRepository.updateInventory).not.toHaveBeenCalled();
      });
    });

    describe("system errors", () => {
      it("should handle database errors gracefully", async () => {
        mockRepository.findById.mockResolvedValue(mockProduct);
        mockRepository.updateInventory.mockRejectedValue(
          new Error("Database error")
        );

        const response = await request(app)
          .post("/inventory/test-id/purchase")
          .send({ quantity: 5 })
          .expect(500);

        expect(response.body).toEqual({
          error: "An unexpected error occurred while processing your request",
          status: 500,
        });
        expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
        expect(mockRepository.updateInventory).toHaveBeenCalledTimes(1);
      });
    });
  });
});
