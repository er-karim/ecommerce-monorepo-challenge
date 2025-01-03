import { ProductLookup } from "../components/product-lookup";

export default function Page(): JSX.Element {
  return (
    <main className="min-h-screen bg-base-200">
      <div className="bg-gradient-to-b from-primary/10 to-base-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Product Inventory
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <ProductLookup />
        </div>
      </div>
    </main>
  );
}
