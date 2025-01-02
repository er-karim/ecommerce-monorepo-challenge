import { InputSanitizer } from "../../../src/utils/sanitization";
import validator from "validator";

jest.mock("validator", () => ({
  trim: jest.fn(),
  stripLow: jest.fn(),
}));

describe("InputSanitizer", () => {
  describe("sanitizeQuantity", () => {
    describe("string input handling", () => {
      it("should trim and return empty string", () => {
        const result = InputSanitizer.sanitizeQuantity("   ");
        expect(result).toBe("");
      });

      it("should trim and return non-empty string", () => {
        const result = InputSanitizer.sanitizeQuantity("  123  ");
        expect(result).toBe("123");
      });
    });

    describe("number input handling", () => {
      it("should return the same number for valid input", () => {
        const result = InputSanitizer.sanitizeQuantity(123);
        expect(result).toBe(123);
      });

      it("should return empty string for NaN", () => {
        const result = InputSanitizer.sanitizeQuantity(NaN);
        expect(result).toBe("");
      });
    });

    describe("invalid input handling", () => {
      it("should return empty string for null input", () => {
        const result = InputSanitizer.sanitizeQuantity(null as any);
        expect(result).toBe("");
      });

      it("should return empty string for undefined input", () => {
        const result = InputSanitizer.sanitizeQuantity(undefined as any);
        expect(result).toBe("");
      });
    });
  });

  describe("sanitizeUUID", () => {
    beforeEach(() => {
      (validator.trim as jest.Mock).mockImplementation((str) => str.trim());
      (validator.stripLow as jest.Mock).mockImplementation((str) => str);
    });

    it("should call validator.trim and validator.stripLow in sequence", () => {
      const input = "  test-uuid  ";
      InputSanitizer.sanitizeUUID(input);

      expect(validator.trim).toHaveBeenCalledWith(input);
      expect(validator.stripLow).toHaveBeenCalledWith(input.trim());
    });

    it("should return sanitized UUID", () => {
      const input = "  test-uuid  ";
      const trimmed = "test-uuid";
      const stripped = "test-uuid";

      (validator.trim as jest.Mock).mockReturnValue(trimmed);
      (validator.stripLow as jest.Mock).mockReturnValue(stripped);

      const result = InputSanitizer.sanitizeUUID(input);
      expect(result).toBe(stripped);
    });
  });
});
