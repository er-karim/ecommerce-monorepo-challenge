import { Request, Response } from "express";
import { sanitizeInventoryInputs } from "../../../src/middlewares/sanitization.middleware";
import { InputSanitizer } from "../../../src/utils/sanitization";
import { ValidationError } from "../../../src/middlewares/validation.middleware";

describe("Sanitization Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let sanitizeUUIDSpy: jest.SpyInstance;
  let sanitizeQuantitySpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
    };
    mockResponse = {};
    mockNext = jest.fn();

    // Setup spies on InputSanitizer static methods
    sanitizeUUIDSpy = jest.spyOn(InputSanitizer, "sanitizeUUID");
    sanitizeQuantitySpy = jest.spyOn(InputSanitizer, "sanitizeQuantity");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Product ID sanitization", () => {
    it("should sanitize product ID from params", () => {
      const rawProductId = " abc123-xyz  ";
      const sanitizedProductId = "abc123-xyz";
      mockRequest.params = { productId: rawProductId };
      sanitizeUUIDSpy.mockReturnValue(sanitizedProductId);

      sanitizeInventoryInputs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sanitizeUUIDSpy).toHaveBeenCalledWith(rawProductId);
      expect(mockRequest.params.productId).toBe(sanitizedProductId);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should handle missing product ID", () => {
      sanitizeInventoryInputs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sanitizeUUIDSpy).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("Quantity sanitization", () => {
    it("should sanitize valid numeric quantity", () => {
      const rawQuantity = "123";
      const sanitizedQuantity = "123";
      mockRequest.body = { quantity: rawQuantity };
      sanitizeQuantitySpy.mockReturnValue(sanitizedQuantity);

      sanitizeInventoryInputs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sanitizeQuantitySpy).toHaveBeenCalledWith(rawQuantity);
      expect(mockRequest.body.quantity).toBe(sanitizedQuantity);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should handle numeric zero quantity and throw ValidationError", () => {
      const rawQuantity = "0";
      mockRequest.body = { quantity: rawQuantity };
      sanitizeQuantitySpy.mockReturnValue(0);

      sanitizeInventoryInputs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sanitizeQuantitySpy).toHaveBeenCalledWith(rawQuantity);
      expect(mockNext).toHaveBeenCalledWith(
        new ValidationError("Quantity must be a valid number")
      );
    });

    it("should handle empty string quantity", () => {
      const rawQuantity = "";
      const sanitizedQuantity = "";
      mockRequest.body = { quantity: rawQuantity };
      sanitizeQuantitySpy.mockReturnValue(sanitizedQuantity);

      sanitizeInventoryInputs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sanitizeQuantitySpy).toHaveBeenCalledWith(rawQuantity);
      expect(mockRequest.body.quantity).toBe(sanitizedQuantity);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should handle missing quantity", () => {
      sanitizeInventoryInputs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sanitizeQuantitySpy).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it("should handle non-numeric quantity", () => {
      const rawQuantity = "invalid";
      const sanitizedQuantity = "invalid";
      mockRequest.body = { quantity: rawQuantity };
      sanitizeQuantitySpy.mockReturnValue(sanitizedQuantity);

      sanitizeInventoryInputs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sanitizeQuantitySpy).toHaveBeenCalledWith(rawQuantity);
      expect(mockRequest.body.quantity).toBe(sanitizedQuantity);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should handle numeric quantity as number type", () => {
      const rawQuantity = 123;
      const sanitizedQuantity = 123;
      mockRequest.body = { quantity: rawQuantity };
      sanitizeQuantitySpy.mockReturnValue(sanitizedQuantity);

      sanitizeInventoryInputs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sanitizeQuantitySpy).toHaveBeenCalledWith(rawQuantity);
      expect(mockRequest.body.quantity).toBe(sanitizedQuantity);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should pass through any errors from sanitization", () => {
      const error = new Error("Sanitization failed");
      sanitizeUUIDSpy.mockImplementation(() => {
        throw error;
      });
      mockRequest.params = { productId: "abc123" };

      sanitizeInventoryInputs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it("should handle both productId and quantity sanitization", () => {
      const rawProductId = " abc123-xyz  ";
      const sanitizedProductId = "abc123-xyz";
      const rawQuantity = "123";
      const sanitizedQuantity = "123";

      mockRequest.params = { productId: rawProductId };
      mockRequest.body = { quantity: rawQuantity };

      sanitizeUUIDSpy.mockReturnValue(sanitizedProductId);
      sanitizeQuantitySpy.mockReturnValue(sanitizedQuantity);

      sanitizeInventoryInputs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sanitizeUUIDSpy).toHaveBeenCalledWith(rawProductId);
      expect(sanitizeQuantitySpy).toHaveBeenCalledWith(rawQuantity);
      expect(mockRequest.params.productId).toBe(sanitizedProductId);
      expect(mockRequest.body.quantity).toBe(sanitizedQuantity);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
