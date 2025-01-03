"use client";

import { useState } from "react";
import { InventoryAPIClient } from "@repo/api-client";
import { FormInput, Alert, Button } from "@repo/ui/components";

interface FormState {
  type: "success" | "error";
  message: string;
}

interface ErrorResponse {
  error: string;
}

export function InventoryForm(): JSX.Element {
  const [productId, setProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [formState, setFormState] = useState<FormState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setFormState(null);

    try {
      const client = new InventoryAPIClient();
      const response = await client.updateInventory(
        productId,
        Number(quantity)
      );
      setFormState({
        type: "success",
        message: response.message,
      });
      setProductId("");
      setQuantity("");
    } catch (error) {
      let errorMessage = "An unexpected error occurred";

      if (error instanceof Error) {
        try {
          const errorResponse = JSON.parse(
            error.message.replace("Error: ", "")
          ) as ErrorResponse;
          errorMessage = errorResponse.error || error.message;
        } catch {
          errorMessage = error.message;
        }
      }

      setFormState({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductIdChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setProductId(e.target.value);
  };

  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setQuantity(e.target.value);
  };

  const renderFormState = (): JSX.Element | null => {
    if (!formState) {
      return null;
    }

    return (
      <div className="mt-6">
        <Alert message={formState.message} type={formState.type} />
      </div>
    );
  };

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="card-body">
        <form
          className="space-y-6"
          onSubmit={(e): void => {
            void handleSubmit(e);
          }}
        >
          <FormInput
            helperText="Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
            id="productId"
            label="Product ID"
            onChange={handleProductIdChange}
            pattern="^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            placeholder="Enter UUID format product ID"
            required
            value={productId}
          />

          <FormInput
            id="quantity"
            label="Quantity"
            max="999999"
            min="1"
            onChange={handleQuantityChange}
            placeholder="Enter quantity to purchase"
            required
            type="number"
            value={quantity}
          />

          <Button
            className="w-full"
            disabled={loading}
            loading={loading}
            type="submit"
          >
            {loading ? "Processing..." : "Update Inventory"}
          </Button>
        </form>

        {renderFormState()}
      </div>
    </div>
  );
}
