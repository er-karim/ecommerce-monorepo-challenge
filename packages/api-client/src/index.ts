import { sanitizeInput } from "./utils/sanitization";

interface APIResponse {
  message: string;
}

interface Product {
  id: string;
  name: string;
  inventoryCount: number;
}

export class InventoryAPIClient {
  private baseUrl: string = "http://localhost:4000/inventory";

  async getProduct(productId: string): Promise<Product> {
    const sanitizedId = sanitizeInput.uuid(productId);
    const response = await fetch(`${this.baseUrl}/${sanitizedId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    return data;
  }

  async updateInventory(
    productId: string,
    quantity: number
  ): Promise<APIResponse> {
    const sanitizedId = sanitizeInput.uuid(productId);
    const sanitizedQuantity = sanitizeInput.quantity(quantity);

    const response = await fetch(`${this.baseUrl}/${sanitizedId}/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity: sanitizedQuantity }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    return data;
  }
}
