import { InventoryService } from "../../../src/services/inventory.service";
import { InventoryRepository } from "../../../src/repositories/inventory.repository";
import {
  ProductNotFoundError,
  InsufficientInventoryError,
} from "../../../src/utils/errors";
import { Product } from "../../../src/models/inventory";

jest.mock("../../../src/repositories/inventory.repository");

describe("InventoryService", () => {
  let service: InventoryService;
  let mockRepository: jest.Mocked<InventoryRepository>;
  const mockProduct: Product = {
    id: "test-id",
    name: "Test Product",
    inventoryCount: 10,
  };

  beforeEach(() => {
    // Reset singleton instances
    jest.clearAllMocks();
    InventoryRepository["instance"] = undefined;
    InventoryService["instance"] = undefined;

    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      updateInventory: jest.fn(),
    } as jest.Mocked<InventoryRepository>;

    // Mock the getInstance method of InventoryRepository
    jest
      .spyOn(InventoryRepository, "getInstance")
      .mockReturnValue(mockRepository);

    // Get a new service instance using singleton pattern
    service = InventoryService.getInstance();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("getProduct", () => {
    it("should return product when found", async () => {
      mockRepository.findById.mockResolvedValueOnce(mockProduct);

      const result = await service.getProduct("test-id");

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
    });

    it("should throw ProductNotFoundError when product doesn't exist", async () => {
      mockRepository.findById.mockResolvedValueOnce(null);

      await expect(service.getProduct("nonexistent-id")).rejects.toThrowError(
        ProductNotFoundError
      );

      expect(mockRepository.findById).toHaveBeenCalledWith("nonexistent-id");
    });

    it("should propagate repository errors", async () => {
      const error = new Error("Database error");
      mockRepository.findById.mockRejectedValueOnce(error);

      await expect(service.getProduct("test-id")).rejects.toThrowError(error);

      expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
    });
  });

  describe("purchaseProduct", () => {
    it("should successfully process purchase when sufficient inventory exists", async () => {
      mockRepository.findById.mockResolvedValueOnce(mockProduct);
      mockRepository.updateInventory.mockResolvedValueOnce();

      await service.purchaseProduct("test-id", 5);

      expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
      expect(mockRepository.updateInventory).toHaveBeenCalledWith(
        "test-id",
        mockProduct.inventoryCount - 5
      );
    });

    it("should throw ProductNotFoundError when product doesn't exist", async () => {
      mockRepository.findById.mockResolvedValueOnce(null);

      await expect(
        service.purchaseProduct("nonexistent-id", 5)
      ).rejects.toThrowError(ProductNotFoundError);

      expect(mockRepository.findById).toHaveBeenCalledWith("nonexistent-id");
    });

    it("should throw InsufficientInventoryError when requested quantity exceeds available stock", async () => {
      const lowStockProduct = { ...mockProduct, inventoryCount: 3 };
      mockRepository.findById.mockResolvedValueOnce(lowStockProduct);

      await expect(service.purchaseProduct("test-id", 5)).rejects.toThrowError(
        InsufficientInventoryError
      );

      expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
    });

    it("should allow purchase of exact available quantity", async () => {
      mockRepository.findById.mockResolvedValueOnce(mockProduct);
      mockRepository.updateInventory.mockResolvedValueOnce();

      await service.purchaseProduct("test-id", mockProduct.inventoryCount);

      expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
      expect(mockRepository.updateInventory).toHaveBeenCalledWith("test-id", 0);
    });

    it("should propagate repository update errors", async () => {
      const error = new Error("Update failed");
      mockRepository.findById.mockResolvedValueOnce(mockProduct);
      mockRepository.updateInventory.mockRejectedValueOnce(error);

      await expect(service.purchaseProduct("test-id", 5)).rejects.toThrowError(
        error
      );

      expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
    });

    it("should calculate correct remaining inventory after purchase", async () => {
      mockRepository.findById.mockResolvedValueOnce(mockProduct);
      mockRepository.updateInventory.mockResolvedValueOnce();

      await service.purchaseProduct("test-id", 3);

      expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
      expect(mockRepository.updateInventory).toHaveBeenCalledWith(
        "test-id",
        mockProduct.inventoryCount - 3
      );
    });
  });
});
