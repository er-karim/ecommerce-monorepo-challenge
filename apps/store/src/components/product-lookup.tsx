"use client";

import { useState } from "react";
import { InventoryAPIClient } from "@repo/api-client";

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
          );
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

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-md">
      <div className="px-6 py-8 sm:px-8">
        <form
          className="space-y-6"
          onSubmit={(e): void => {
            void handleSubmit(e);
          }}
        >
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="productId"
            >
              Product ID
              <span className="ml-1 text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                id="productId"
                onChange={handleProductIdChange}
                pattern="^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
                placeholder="Enter UUID format product ID"
                required
                title="Please enter a valid UUID"
                type="text"
                value={productId}
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
              </p>
            </div>
          </div>

          <button
            className={`relative w-full rounded-md px-4 py-3 text-sm font-semibold text-white transition-all
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              }`}
            disabled={loading}
            type="submit"
          >
            {loading && (
              <span className="absolute inset-y-0 left-4 flex items-center">
                <svg
                  className="h-5 w-5 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </span>
            )}
            <span className={loading ? "ml-6" : ""}>
              {loading ? "Looking up..." : "Check Inventory"}
            </span>
          </button>
        </form>

        {lookupState && (
          <div
            className={`mt-6 rounded-md p-4 ${
              lookupState.type === "error"
                ? "bg-red-50 border border-red-200"
                : "bg-green-50 border border-green-200"
            }`}
          >
            {lookupState.type === "error" ? (
              <div className="flex items-center">
                <span className="flex-shrink-0 h-5 w-5 mr-3 text-red-400">
                  ⚠️
                </span>
                <p className="text-sm text-red-700">{lookupState.message}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="flex-shrink-0 h-5 w-5 mr-3 text-green-400">
                    ✓
                  </span>
                  <p className="text-sm font-medium text-green-800">
                    Product Found
                  </p>
                </div>
                <div className="pl-8 space-y-2">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Name:</span>{" "}
                    {lookupState.data.name}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Available:</span>{" "}
                    <span
                      className={`font-medium ${
                        lookupState.data.inventoryCount < 10
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {lookupState.data.inventoryCount} units
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
