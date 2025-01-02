import { InventoryAPIClient } from "../../src/index";
import { sanitizeInput } from "../../src/utils/sanitization";

// Mock the sanitization utilities
jest.mock("../../src/utils/sanitization", () => ({
  sanitizeInput: {
    uuid: jest.fn(),
    quantity: jest.fn(),
  },
}));

// Mock the global fetch function
global.fetch = jest.fn();

describe("InventoryAPIClient", () => {
  let client: InventoryAPIClient;

  beforeEach(() => {
    client = new InventoryAPIClient();
    // Reset all mocks before each test
    jest.resetAllMocks();
    (sanitizeInput.uuid as jest.Mock).mockImplementation((id) => id);
    (sanitizeInput.quantity as jest.Mock).mockImplementation((qty) => qty);
  });

  describe("getProduct", () => {
    const mockProduct = {
      id: "123",
      name: "Test Product",
      inventoryCount: 10,
    };

    it("should successfully fetch a product", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockProduct),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await client.getProduct("123");

      expect(sanitizeInput.uuid).toHaveBeenCalledWith("123");
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4000/inventory/123"
      );
      expect(result).toEqual(mockProduct);
    });

    it("should throw error on failed request", async () => {
      const errorResponse = {
        error: "Product not found",
        status: 404,
      };
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve(errorResponse),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(client.getProduct("123")).rejects.toThrow(
        JSON.stringify(errorResponse)
      );
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(client.getProduct("123")).rejects.toThrow("Network error");
    });
  });

  describe("updateInventory", () => {
    const mockResponse = {
      message: "Inventory updated successfully",
    };

    it("should successfully update inventory", async () => {
      const mockFetchResponse = {
        ok: true,
        json: () => Promise.resolve(mockResponse),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

      const result = await client.updateInventory("123", 5);

      expect(sanitizeInput.uuid).toHaveBeenCalledWith("123");
      expect(sanitizeInput.quantity).toHaveBeenCalledWith(5);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4000/inventory/123/purchase",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: 5 }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error on failed update", async () => {
      const errorResponse = {
        error: "Invalid quantity",
        status: 400,
      };
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve(errorResponse),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(client.updateInventory("123", 0)).rejects.toThrow(
        JSON.stringify(errorResponse)
      );
    });

    it("should handle network errors during update", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(client.updateInventory("123", 5)).rejects.toThrow(
        "Network error"
      );
    });

    it("should sanitize inputs before making request", async () => {
      const mockFetchResponse = {
        ok: true,
        json: () => Promise.resolve(mockResponse),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

      (sanitizeInput.uuid as jest.Mock).mockReturnValue("sanitized-id");
      (sanitizeInput.quantity as jest.Mock).mockReturnValue(10);

      await client.updateInventory("123", 5);

      expect(sanitizeInput.uuid).toHaveBeenCalledWith("123");
      expect(sanitizeInput.quantity).toHaveBeenCalledWith(5);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4000/inventory/sanitized-id/purchase",
        expect.any(Object)
      );
    });
  });
});
