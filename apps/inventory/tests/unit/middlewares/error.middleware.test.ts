import { Request, Response } from "express";
import { errorHandler } from "../../../src/middlewares/error.middleware";
import {
  ProductNotFoundError,
  InsufficientInventoryError,
} from "../../../src/utils/errors";

describe("Error Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should handle ProductNotFoundError correctly", () => {
    const error = new ProductNotFoundError("test-id");

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Product not found: test-id",
      status: 404,
    });
  });

  it("should handle InsufficientInventoryError correctly", () => {
    const error = new InsufficientInventoryError("test-id", 10, 5);

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.stringContaining("Insufficient inventory"),
      status: 409,
    });
  });

  it("should handle generic server errors", () => {
    const error = new Error("Unknown error");

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "An unexpected error occurred while processing your request",
      status: 500,
    });
  });
});
