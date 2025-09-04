import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { ProductCard } from "./ProductCard";
import { EditProductForm } from "./EditProductForm";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { SyncManager } from "@/utils/syncManager";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export function InventoryTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    isOnline,
    products,
    pendingOps,
    updateProducts,
    deleteProductOptimistic,
    clearPendingOperations
  } = useOfflineStorage();

  // Fetch products and sync when online
  useEffect(() => {
    fetchProducts();
    
    // Auto-sync when coming back online
    if (isOnline && pendingOps.length > 0) {
      syncPendingOperations();
    }
  }, [isOnline]);

  const fetchProducts = async () => {
    if (!isOnline) {
      // Use cached data when offline
      setLoading(false);
      return;
    }

    try {
      const syncManager = SyncManager.getInstance();
      const latestProducts = await syncManager.fetchLatestProducts();
      updateProducts(latestProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Sync Error",
        description: "Using cached data. Will sync when online.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncPendingOperations = async () => {
    try {
      const syncManager = SyncManager.getInstance();
      const success = await syncManager.syncPendingOperations(pendingOps);
      
      if (success) {
        clearPendingOperations();
        await fetchProducts(); // Refresh data after sync
        toast({
          title: "Synced",
          description: "All changes have been synchronized.",
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  };
  
  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    // Refresh products from database if online
    if (isOnline) {
      fetchProducts();
    }
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    // Optimistically delete the product
    deleteProductOptimistic(productToDelete);
    
    toast({
      title: "Product deleted",
      description: isOnline ? "The product has been deleted." : "Product will be deleted when online.",
    });
    
    // If online, try to sync immediately
    if (isOnline) {
      try {
        const syncManager = SyncManager.getInstance();
        await syncManager.syncPendingOperations([{
          id: productToDelete,
          type: 'delete',
          data: { id: productToDelete },
          timestamp: Date.now()
        }]);
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Sync Error",
          description: "Product deleted locally. Will sync when online.",
          variant: "destructive",
        });
      }
    }
    
    setDeleteConfirmOpen(false);
    setProductToDelete(null);
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
        <h2 className="text-2xl font-bold text-gradient mb-2">
          Inventory
          {!isOnline && <span className="text-xs bg-orange-500/20 text-orange-600 px-2 py-1 rounded-full ml-2">Offline</span>}
          {pendingOps.length > 0 && <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-1 rounded-full ml-2">{pendingOps.length} pending</span>}
        </h2>
        <p className="text-muted-foreground">Manage your products</p>
      </div>

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
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}