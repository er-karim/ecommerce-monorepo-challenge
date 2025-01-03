import { InventoryForm } from "../components/inventory-form";

export default function Page(): JSX.Element {
  return (
    <main className="min-h-screen bg-base-200">
      <div className="bg-gradient-to-b from-primary/10 to-base-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Inventory Management
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl font-bold mb-6">
                Update Inventory
              </h2>
              <InventoryForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
