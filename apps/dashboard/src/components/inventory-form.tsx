"use client";

import { useState } from "react";
import { InventoryAPIClient } from "@repo/api-client";

interface SuccessState {
  type: "success";
  message: string;
}

interface ErrorState {
  type: "error";
  message: string;
}

const inputStyles =
  "form-input block w-full rounded-lg border-gray-200 shadow-form px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:ring-brand-500 sm:text-sm transition-colors";

const buttonStyles =
  "relative w-full rounded-lg px-6 py-3.5 text-sm font-medium text-white shadow-soft transition-all";

type FormState = SuccessState | ErrorState | null;

export function InventoryForm(): JSX.Element {
  const [productId, setProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [formState, setFormState] = useState<FormState>(null);
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
    } catch (error) {
      // Parse the error response from the server
      let errorMessage = "An unexpected error occurred";

      if (error instanceof Error) {
        try {
          // Attempt to parse the error message as a JSON response
          const errorResponse = JSON.parse(
            error.message.replace("Error: ", "")
          );
          errorMessage = errorResponse.error || error.message;
        } catch {
          // If parsing fails, use the original error message
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

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-200 hover:shadow-lg">
      <div className="px-8 py-10">
        <form
          className="space-y-6"
          onSubmit={(e): void => {
            void handleSubmit(e);
          }}
        >
          <div className="space-y-4">
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
                  className={inputStyles}
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

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="quantity"
              >
                Quantity
                <span className="ml-1 text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  className={inputStyles}
                  id="quantity"
                  max="999999"
                  min="1"
                  onChange={handleQuantityChange}
                  placeholder="Enter quantity to purchase"
                  required
                  type="number"
                  value={quantity}
                />
              </div>
            </div>
          </div>

          <button
            className={`${buttonStyles} ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
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
              {loading ? "Processing..." : "Update Inventory"}
            </span>
          </button>
        </form>

        {formState && (
          <div
            className={`mt-6 rounded-xl p-4 ${
              formState.type === "error"
                ? "bg-red-50 border border-red-100 shadow-soft"
                : "bg-green-50 border border-green-100 shadow-soft"
            }`}
          >
            <div className="flex items-center">
              <span
                className={`flex-shrink-0 h-5 w-5 mr-3 ${
                  formState.type === "error" ? "text-red-400" : "text-green-400"
                }`}
              >
                {formState.type === "error" ? "⚠️" : "✓"}
              </span>
              <p
                className={`text-sm ${
                  formState.type === "error" ? "text-red-700" : "text-green-700"
                }`}
              >
                {formState.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
