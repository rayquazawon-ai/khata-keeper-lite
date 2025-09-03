import { useState, useEffect } from "react";
import { ArrowLeft, Camera, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { updateProduct, uploadProductPhoto } from "@/lib/supabase";

interface Product {
  id: string;
  product_name: string;
  cost_price: number;
  selling_price: number;
  lowest_selling_price: number;
  discount_percent?: number;
  photos?: string[];
}

interface EditProductFormProps {
  product: Product;
  onBack: () => void;
  onSuccess: () => void;
}

export function EditProductForm({ product, onBack, onSuccess }: EditProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>(product.photos || []);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    product_name: product.product_name,
    cost_price: product.cost_price.toString(),
    selling_price: product.selling_price.toString(),
    lowest_selling_price: product.lowest_selling_price.toString(),
    discount_percent: product.discount_percent?.toString() || ""
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newPhotos = [...photos, ...files].slice(0, 5 - photoUrls.length);
    setPhotos(newPhotos);

    // Create preview URLs for new photos
    const newUrls = files.map(file => URL.createObjectURL(file));
    setPhotoUrls([...photoUrls, ...newUrls].slice(0, 5));
  };

  const removePhoto = (index: number) => {
    if (index < (product.photos?.length || 0)) {
      // Removing existing photo
      const newUrls = photoUrls.filter((_, i) => i !== index);
      setPhotoUrls(newUrls);
    } else {
      // Removing newly added photo
      const photoIndex = index - (product.photos?.length || 0);
      const newPhotos = photos.filter((_, i) => i !== photoIndex);
      const newUrls = photoUrls.filter((_, i) => i !== index);
      setPhotos(newPhotos);
      setPhotoUrls(newUrls);
    }
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
      let finalPhotoUrls = [...(product.photos || [])];

      // Upload new photos if any
      if (photos.length > 0) {
        const uploadedUrls = await Promise.all(
          photos.map(photo => uploadProductPhoto(photo, product.id))
        );
        
        // Filter out removed photos (ones that existed but are no longer in photoUrls)
        const existingPhotos = product.photos || [];
        const remainingExistingPhotos = photoUrls.filter(url => existingPhotos.includes(url));
        
        finalPhotoUrls = [...remainingExistingPhotos, ...uploadedUrls];
      } else {
        // No new photos, just filter existing ones
        const existingPhotos = product.photos || [];
        finalPhotoUrls = photoUrls.filter(url => existingPhotos.includes(url));
      }

      // Update product
      const updateData = {
        product_name: formData.product_name,
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        lowest_selling_price: parseFloat(formData.lowest_selling_price),
        discount_percent: formData.discount_percent ? parseFloat(formData.discount_percent) : undefined,
        photos: finalPhotoUrls
      };

      await updateProduct(product.id, updateData);

      toast({
        title: "Product Updated",
        description: `${formData.product_name} has been updated successfully.`,
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-bold text-gradient">Edit Product</h2>
          <p className="text-muted-foreground">Update {product.product_name}</p>
        </div>
      </div>

      {/* Form */}
      <Card className="card-electric p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-3">
            <Label>Product Photos</Label>
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
          <Button type="submit" className="w-full btn-primary" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Updating Product..." : "Update Product"}
          </Button>
        </form>
      </Card>
    </div>
  );
}