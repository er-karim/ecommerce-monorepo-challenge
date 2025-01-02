export const sanitizeInput = {
  uuid: (input: string): string => {
    return input.trim().replace(/[^a-fA-F0-9-]/g, "");
  },

  quantity: (input: number | string): number => {
    const num = Number(input);
    return Number.isInteger(num) && num > 0 ? num : 0;
  },
};
