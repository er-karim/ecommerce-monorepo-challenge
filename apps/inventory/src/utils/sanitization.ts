import validator from "validator";

export class InputSanitizer {
  static sanitizeQuantity(input: number | string): number | string {
    if (typeof input === "string") {
      const trimmed = input.trim();
      if (trimmed === "") {
        return trimmed;
      }
      // Pass through string inputs for validation layer to handle
      return trimmed;
    }

    if (typeof input === "number") {
      if (Number.isNaN(input)) {
        return "";
      }
      return input;
    }

    return "";
  }

  static sanitizeUUID(input: string): string {
    return validator.stripLow(validator.trim(input));
  }
}
