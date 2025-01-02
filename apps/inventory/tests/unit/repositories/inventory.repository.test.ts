import { InventoryRepository } from "../../../src/repositories/inventory.repository";
import { db } from "../../../src/config/database";

jest.mock("../../../src/config/database", () => ({
  db: {
    select: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    update: jest.fn(),
  },
}));

describe("InventoryRepository", () => {
  let repository: InventoryRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = InventoryRepository.getInstance();
  });

  describe("findById", () => {
    it("should return product when found", async () => {
      const mockProduct = {
        id: "test-id",
        name: "Test Product",
        inventoryCount: 10,
      };

      const mockWhere = jest.fn().mockResolvedValue([mockProduct]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await repository.findById("test-id");

      expect(result).toEqual(mockProduct);
    });

    it("should return null when product is not found", async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await repository.findById("nonexistent-id");

      expect(result).toBeNull();
    });
  });

  describe("updateInventory", () => {
    it("should update inventory count successfully", async () => {
      const mockUpdateWhere = jest.fn().mockResolvedValue([]);
      const mockSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
      (db.update as jest.Mock).mockReturnValue({ set: mockSet });

      await repository.updateInventory("test-id", 5);

      expect(mockSet).toHaveBeenCalledWith({ inventoryCount: 5 });
      expect(mockUpdateWhere).toHaveBeenCalled();
    });
  });
});
