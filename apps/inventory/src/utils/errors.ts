export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ProductNotFoundError extends AppError {
  constructor(productId: string) {
    super(404, `Product not found: ${productId}`);
    Object.setPrototypeOf(this, ProductNotFoundError.prototype);
  }
}

export class InsufficientInventoryError extends AppError {
  constructor(productId: string, requested: number, available: number) {
    super(
      409,
      `Insufficient inventory for product ${productId}: requested ${requested}, available ${available}`
    );
    Object.setPrototypeOf(this, InsufficientInventoryError.prototype);
  }
}
