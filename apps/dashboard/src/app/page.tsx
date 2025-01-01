import { InventoryForm } from "../components/inventory-form";

export default function Page(): JSX.Element {
  return (
    <main className="min-h-screen bg-gradient-soft px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Inventory Management
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Update product inventory levels and manage stock quantities
          </p>
        </header>
        <InventoryForm />
      </div>
    </main>
  );
}
