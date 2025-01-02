import { sanitizeInput } from "../../../src/utils/sanitization";

describe("sanitizeInput", () => {
  describe("uuid", () => {
    it("should trim whitespace from UUID", () => {
      const input = "  123e4567-e89b-12d3-a456-426614174000  ";
      const expected = "123e4567-e89b-12d3-a456-426614174000";
      expect(sanitizeInput.uuid(input)).toBe(expected);
    });

    it("should remove non-hexadecimal characters", () => {
      const input = "123e4567-e89b-12d3-xyz!@#$-426614174000";
      const expected = "123e4567-e89b-12d3--426614174000";
      expect(sanitizeInput.uuid(input)).toBe(expected);
    });

    it("should handle empty string", () => {
      expect(sanitizeInput.uuid("")).toBe("");
    });

    it("should handle string with only invalid characters", () => {
      expect(sanitizeInput.uuid("!@#$%^&*()")).toBe("");
    });

    it("should preserve hyphens", () => {
      const input = "550e8400-e29b-41d4-a716-446655440000";
      expect(sanitizeInput.uuid(input)).toBe(input);
    });
  });

  describe("quantity", () => {
    it("should handle valid positive integers", () => {
      expect(sanitizeInput.quantity(5)).toBe(5);
      expect(sanitizeInput.quantity("10")).toBe(10);
    });

    it("should handle zero and negative numbers", () => {
      expect(sanitizeInput.quantity(0)).toBe(0);
      expect(sanitizeInput.quantity(-5)).toBe(0);
      expect(sanitizeInput.quantity("-10")).toBe(0);
    });

    it("should handle decimal numbers", () => {
      expect(sanitizeInput.quantity(5.7)).toBe(0);
      expect(sanitizeInput.quantity("10.5")).toBe(0);
    });

    it("should handle invalid number strings", () => {
      expect(sanitizeInput.quantity("abc")).toBe(0);
      expect(sanitizeInput.quantity("12.34.56")).toBe(0);
    });

    it("should handle empty string", () => {
      expect(sanitizeInput.quantity("")).toBe(0);
    });

    it("should handle maximum safe integer", () => {
      const max = Number.MAX_SAFE_INTEGER;
      expect(sanitizeInput.quantity(max)).toBe(max);
    });
  });
});
