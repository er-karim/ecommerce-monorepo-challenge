export interface Product {
  id: string;
  name: string;
  inventoryCount: number;
}

export interface UpdateInventoryRequest {
  quantity: number | string;
}
