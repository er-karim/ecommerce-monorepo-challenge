import { validateQuantity } from "../../../src/middlewares/validation.middleware";
import { Request, Response } from "express";

describe("Validation Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {} as Request["body"],
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  it("should allow valid positive integers", () => {
    mockRequest.body.quantity = "5";

    validateQuantity(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockRequest.body.quantity).toBe(5);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it("should reject negative numbers", () => {
    mockRequest.body.quantity = -1;

    validateQuantity(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: expect.stringContaining("Invalid quantity"),
      })
    );
  });

  it("should reject zero", () => {
    mockRequest.body.quantity = 0;

    validateQuantity(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
      })
    );
  });

  it("should reject non-numeric strings", () => {
    mockRequest.body.quantity = "abc";

    validateQuantity(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
      })
    );
  });
});
