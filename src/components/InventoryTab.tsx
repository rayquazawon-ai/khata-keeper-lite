import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { ProductCard } from "./ProductCard";
import { EditProductForm } from "./EditProductForm";
import { supabase } from "@/integrations/supabase/client";

export function InventoryTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from database
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match component expectations
      const transformedProducts = data?.map(product => ({
        id: product.id,
        productName: product.product_name,
        costPrice: product.cost_price,
        sellingPrice: product.selling_price,
        lowestSellingPrice: product.lowest_selling_price,
        quantity: product.quantity,
        photos: product.photos || []
      })) || [];

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = products.filter(p => 
    p.quantity !== undefined && p.quantity < 5
  ).length;

  const noQuantityCount = products.filter(p => 
    p.quantity === undefined
  ).length;

  const handleEdit = (product: any) => {
    // Convert mock data format to expected format
    const editableProduct = {
      id: product.id,
      product_name: product.productName,
      cost_price: product.costPrice,
      selling_price: product.sellingPrice,
      lowest_selling_price: product.lowestSellingPrice,
      discount_percent: undefined,
      photos: product.photos || []
    };
    setEditingProduct(editableProduct);
  };

  const handleEditSuccess = () => {
    setEditingProduct(null);
    // Refresh products from database
    fetchProducts();
  };

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      // Refresh products list
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Show edit form if editing
  if (editingProduct) {
    return (
      <EditProductForm
        product={editingProduct}
        onBack={() => setEditingProduct(null)}
        onSuccess={handleEditSuccess}
      />
    );
  }

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
        suggestions={products.map(p => p.productName)}
      />

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  );
}