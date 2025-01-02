import { Request, Response } from "express";
import { validateQuantity } from "../../../src/middlewares/validation.middleware";

describe("Validation Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe("validateQuantity", () => {
    const validationTestCases = [
      {
        scenario: "reject negative integers",
        input: -5,
        expectedMessage: "Quantity must be a positive integer",
      },
      {
        scenario: "reject floating point numbers",
        input: 5.5,
        expectedMessage: "Quantity must be an integer value",
      },
      {
        scenario: "reject non-numeric strings",
        input: "abc",
        expectedMessage: "Quantity must be a valid number",
      },
      {
        scenario: "reject empty values",
        input: "",
        expectedMessage: "Quantity must be a valid number",
      },
    ];

    validationTestCases.forEach(({ scenario, input, expectedMessage }) => {
      it(`should ${scenario}`, () => {
        mockRequest.body = { quantity: input };

        validateQuantity(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 400,
            message: expectedMessage,
          })
        );
      });
    });
  });
});
