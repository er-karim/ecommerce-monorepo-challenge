import { InventoryService } from "../../../src/services/inventory.service";
import { InventoryRepository } from "../../../src/repositories/inventory.repository";
import {
  ProductNotFoundError,
  InsufficientInventoryError,
} from "../../../src/utils/errors";
import { Product } from "../../../src/models/inventory";

describe("InventoryService", () => {
  let service: InventoryService;
  let mockRepository: jest.Mocked<InventoryRepository>;
  const mockProduct: Product = {
    id: "test-id",
    name: "Test Product",
    inventoryCount: 10,
  };

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      updateInventory: jest.fn(),
    } as jest.Mocked<InventoryRepository>;

    service = new InventoryService(mockRepository);
  });

  describe("getProduct", () => {
    it("should return the product when it exists", async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.getProduct("test-id");

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
    });

    it("should throw ProductNotFoundError when product doesn't exist", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getProduct("nonexistent-id")).rejects.toThrow(
        ProductNotFoundError
      );

      expect(mockRepository.findById).toHaveBeenCalledWith("nonexistent-id");
    });

    it("should propagate repository errors", async () => {
      const error = new Error("Database connection failed");
      mockRepository.findById.mockRejectedValue(error);

      await expect(service.getProduct("test-id")).rejects.toThrow(error);
    });
  });

  describe("purchaseProduct", () => {
    it("should successfully process purchase when sufficient inventory exists", async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);
      mockRepository.updateInventory.mockResolvedValue();

      await service.purchaseProduct("test-id", 5);

      expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
      expect(mockRepository.updateInventory).toHaveBeenCalledWith("test-id", 5);
    });

    it("should throw ProductNotFoundError when product doesn't exist", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.purchaseProduct("nonexistent-id", 5)
      ).rejects.toThrow(ProductNotFoundError);

      expect(mockRepository.findById).toHaveBeenCalledWith("nonexistent-id");
      expect(mockRepository.updateInventory).not.toHaveBeenCalled();
    });

    it("should throw InsufficientInventoryError when requested quantity exceeds available stock", async () => {
      const lowStockProduct = { ...mockProduct, inventoryCount: 3 };
      mockRepository.findById.mockResolvedValue(lowStockProduct);

      await expect(service.purchaseProduct("test-id", 5)).rejects.toThrow(
        InsufficientInventoryError
      );

      expect(mockRepository.updateInventory).not.toHaveBeenCalled();
    });

    it("should allow purchase of exact available quantity", async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);
      mockRepository.updateInventory.mockResolvedValue();

      await service.purchaseProduct("test-id", mockProduct.inventoryCount);

      expect(mockRepository.updateInventory).toHaveBeenCalledWith("test-id", 0);
    });

    it("should propagate repository update errors", async () => {
      const error = new Error("Update failed");
      mockRepository.findById.mockResolvedValue(mockProduct);
      mockRepository.updateInventory.mockRejectedValue(error);

      await expect(service.purchaseProduct("test-id", 5)).rejects.toThrow(
        error
      );
    });

    it("should calculate correct remaining inventory after purchase", async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);
      mockRepository.updateInventory.mockResolvedValue();

      await service.purchaseProduct("test-id", 3);

      expect(mockRepository.updateInventory).toHaveBeenCalledWith(
        "test-id",
        mockProduct.inventoryCount - 3
      );
    });
  });
});
