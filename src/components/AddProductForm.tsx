import { useState } from "react";
import { ArrowLeft, Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { SyncManager } from "@/utils/syncManager";
import { createProduct, uploadProductPhoto, updateProduct } from "@/lib/supabase";

interface AddProductFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function AddProductForm({ onBack, onSuccess }: AddProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const { toast } = useToast();
  const { isOnline, addProductOptimistic } = useOfflineStorage();

  const [formData, setFormData] = useState({
    product_name: "",
    cost_price: "",
    selling_price: "",
    lowest_selling_price: "",
    discount_percent: ""
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newPhotos = [...photos, ...files].slice(0, 5); // Max 5 photos
    setPhotos(newPhotos);

    // Create preview URLs
    const newUrls = files.map(file => URL.createObjectURL(file));
    setPhotoUrls([...photoUrls, ...newUrls].slice(0, 5));
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newUrls = photoUrls.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.product_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.selling_price) < parseFloat(formData.lowest_selling_price)) {
      toast({
        title: "Validation Error", 
        description: "Selling price cannot be lower than lowest selling price.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate temporary ID for optimistic update
      const tempId = crypto.randomUUID();
      
      // Create optimistic product data
      const optimisticProduct = {
        id: tempId,
        productName: formData.product_name,
        costPrice: parseFloat(formData.cost_price),
        sellingPrice: parseFloat(formData.selling_price),
        lowestSellingPrice: parseFloat(formData.lowest_selling_price),
        photos: photoUrls, // Use preview URLs for immediate display
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local state immediately (optimistic update)
      addProductOptimistic(optimisticProduct);

      // Show immediate success feedback
      toast({
        title: "Product Added",
        description: isOnline ? `${formData.product_name} has been added to inventory.` : `${formData.product_name} added. Will sync when online.`,
      });

      // Navigate back immediately
      onSuccess();

      // Handle background operations
      if (isOnline) {
        // Background sync - don't await this
        handleBackgroundSync(tempId, optimisticProduct);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error", 
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundSync = async (tempId: string, optimisticProduct: any) => {
    try {
      // Create product in database
      const productData = {
        product_name: optimisticProduct.productName,
        cost_price: optimisticProduct.costPrice,
        selling_price: optimisticProduct.sellingPrice,
        lowest_selling_price: optimisticProduct.lowestSellingPrice,
        discount_percent: formData.discount_percent ? parseFloat(formData.discount_percent) : undefined,
        quantity: null,
        photos: [] as string[]
      };

      const product = await createProduct(productData);

      // Upload photos if any
      if (photos.length > 0) {
        const uploadedUrls = await Promise.all(
          photos.map(photo => uploadProductPhoto(photo, product.id))
        );
        
        // Update product with photo URLs
        await updateProduct(product.id, { photos: uploadedUrls });
      }

      console.log('Background sync completed for product:', product.id);
    } catch (error) {
      console.error('Background sync failed:', error);
      // Could show a subtle notification about sync failure
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gradient">Add New Product</h2>
          <p className="text-muted-foreground">Add item to your inventory</p>
        </div>
      </div>

      {/* Form */}
      <Card className="card-electric p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-3">
            <Label>Product Photos (Optional)</Label>
            <div className="grid grid-cols-3 gap-3">
              {photoUrls.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {photoUrls.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-primary/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Camera className="h-6 w-6 text-primary/50 mb-1" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name *</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_price">Cost Price *</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  placeholder="₹0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="selling_price">Selling Price *</Label>
                <Input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  placeholder="₹0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lowest_selling_price">Lowest Price *</Label>
                <Input
                  id="lowest_selling_price"
                  type="number"
                  step="0.01"
                  value={formData.lowest_selling_price}
                  onChange={(e) => setFormData({ ...formData, lowest_selling_price: e.target.value })}
                  placeholder="₹0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_percent">Discount %</Label>
                <Input
                  id="discount_percent"
                  type="number"
                  step="0.1"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding Product..." : "Add Product"}
          </Button>
        </form>
      </Card>
    </div>
  );
}