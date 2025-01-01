import { ProductLookup } from "../components/product-lookup";

export default function Page(): JSX.Element {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Product Inventory Lookup
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Check current inventory levels for any product
          </p>
        </header>
        <ProductLookup />
      </div>
    </main>
  );
}
