"use client";

import { useState } from "react";
import { InventoryAPIClient } from "@repo/api-client";
import { FormInput, Alert, Button } from "@repo/ui/components";

interface Product {
  id: string;
  name: string;
  inventoryCount: number;
}

interface SuccessState {
  type: "success";
  data: Product;
}

interface ErrorState {
  type: "error";
  message: string;
}

interface ErrorResponse {
  error: string;
}

type LookupState = SuccessState | ErrorState | null;

export function ProductLookup(): JSX.Element {
  const [productId, setProductId] = useState<string>("");
  const [lookupState, setLookupState] = useState<LookupState>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setLookupState(null);

    try {
      const client = new InventoryAPIClient();
      const product = await client.getProduct(productId);
      setLookupState({
        type: "success",
        data: product,
      });
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

      setLookupState({
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

  const renderInventoryStatus = (product: Product): JSX.Element => {
    const isLowStock = product.inventoryCount < 10;

    return (
      <div className="space-y-4">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Product Name</div>
            <div className="stat-value text-lg">{product.name}</div>
          </div>

          <div className="stat">
            <div className="stat-title">Inventory Status</div>
            <div className="stat-value text-lg">
              <div className="flex items-center gap-2">
                <span
                  className={`badge badge-lg ${isLowStock ? "badge-error" : "badge-success"}`}
                >
                  {product.inventoryCount} units
                </span>
              </div>
            </div>
            <div className="stat-desc">
              {isLowStock ? "Low stock alert!" : "Good stock level"}
            </div>
          </div>
        </div>

        {isLowStock && (
          <div className="alert alert-warning">
            <svg
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>Low stock warning! Order soon to ensure availability.</span>
          </div>
        )}
      </div>
    );
  };

  const renderLookupState = (): JSX.Element | null => {
    if (!lookupState) {
      return null;
    }

    if (lookupState.type === "error") {
      return <Alert message={lookupState.message} type="error" />;
    }

    return renderInventoryStatus(lookupState.data);
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

          <Button
            className="w-full"
            disabled={loading}
            loading={loading}
            type="submit"
          >
            {loading ? "Looking up..." : "Check Inventory"}
          </Button>
        </form>

        {lookupState && <div className="divider" />}
        {renderLookupState()}
      </div>
    </div>
  );
}
