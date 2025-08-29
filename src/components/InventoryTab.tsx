import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { ProductCard } from "./ProductCard";

// Mock data - in real app this would come from your backend
const mockProducts = [
  {
    id: "1",
    productName: "LED Bulb 9W Cool White",
    costPrice: 45,
    sellingPrice: 65,
    lowestSellingPrice: 55,
    quantity: 25,
    photos: []
  },
  {
    id: "2", 
    productName: "Extension Cord 5 Meter",
    costPrice: 150,
    sellingPrice: 220,
    lowestSellingPrice: 190,
    quantity: 2,
    photos: []
  },
  {
    id: "3",
    productName: "Wall Socket 2 Pin",
    costPrice: 25,
    sellingPrice: 40,
    lowestSellingPrice: 30,
    quantity: 0,
    photos: []
  },
  {
    id: "4",
    productName: "Table Fan 16 Inch",
    costPrice: 1200,
    sellingPrice: 1650,
    lowestSellingPrice: 1400,
    quantity: undefined,
    photos: []
  }
];

export function InventoryTab() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredProducts = mockProducts.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = mockProducts.filter(p => 
    p.quantity !== undefined && p.quantity < 5
  ).length;

  const noQuantityCount = mockProducts.filter(p => 
    p.quantity === undefined
  ).length;

  const handleEdit = (product: any) => {
    // TODO: Navigate to edit product screen
    console.log("Edit product:", product);
  };

  const handleAddToKhata = (product: any) => {
    // TODO: Navigate to add khata entry screen
    console.log("Add to khata:", product);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Inventory</h2>
        <p className="text-muted-foreground">Manage your products</p>
      </div>

      {/* Warning Banner */}
      {(lowStockCount > 0 || noQuantityCount > 0) && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Attention Required</span>
          </div>
          <div className="text-sm text-warning/80 mt-1">
            {lowStockCount > 0 && `${lowStockCount} item(s) low in stock. `}
            {noQuantityCount > 0 && `${noQuantityCount} item(s) missing quantity info.`}
          </div>
        </div>
      )}

      {/* Search */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search products..."
      />

      {/* Product Grid */}
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={handleEdit}
            onAddToKhata={handleAddToKhata}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  );
}