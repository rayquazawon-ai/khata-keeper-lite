import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, IndianRupee, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { updateKhataEntry, getProducts, Product, KhataEntry } from "@/lib/supabase";

interface EditKhataEntryFormProps {
  entry: KhataEntry;
  onBack: () => void;
  onSuccess: () => void;
}

export function EditKhataEntryForm({ entry, onBack, onSuccess }: EditKhataEntryFormProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    products_taken: (entry.products_taken as Array<{ product_id: string; product_name: string; quantity: number }>) || [],
    amount_paid: entry.amount_paid || 0,
    remaining_due: entry.remaining_due || 0,
    bill_photo_url: entry.bill_photo_url || ""
  });

  const [newProduct, setNewProduct] = useState({
    product_id: "",
    quantity: 1
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const addProduct = () => {
    if (!newProduct.product_id || newProduct.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Please select a product and enter a valid quantity.",
        variant: "destructive",
      });
      return;
    }

    const selectedProduct = products.find(p => p.id === newProduct.product_id);
    if (!selectedProduct) return;

    const productEntry = {
      product_id: newProduct.product_id,
      product_name: selectedProduct.product_name,
      quantity: newProduct.quantity
    };

    setFormData(prev => ({
      ...prev,
      products_taken: [...prev.products_taken, productEntry]
    }));

    setNewProduct({ product_id: "", quantity: 1 });
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products_taken: prev.products_taken.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.products_taken.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one product.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await updateKhataEntry(entry.id, {
        date: formData.date,
        products_taken: formData.products_taken,
        amount_paid: formData.amount_paid,
        remaining_due: formData.remaining_due,
        bill_photo_url: formData.bill_photo_url || undefined
      });

      toast({
        title: "Khata Entry Updated",
        description: "Entry has been updated successfully.",
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating khata entry:", error);
      toast({
        title: "Error",
        description: "Failed to update khata entry. Please try again.",
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
          <h2 className="text-2xl font-bold text-gradient">Edit Khata Entry</h2>
          <p className="text-muted-foreground">Update entry details</p>
        </div>
      </div>

      {/* Form */}
      <Card className="card-electric p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Products Section */}
          <div className="space-y-4">
            <Label>Products Taken</Label>
            
            {/* Add Product */}
            <div className="flex gap-2">
              <select
                value={newProduct.product_id}
                onChange={(e) => setNewProduct({ ...newProduct, product_id: e.target.value })}
                className="flex-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Select product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.product_name}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min="1"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 1 })}
                placeholder="Qty"
                className="w-20"
              />
              <Button type="button" onClick={addProduct} variant="outline">
                Add
              </Button>
            </div>

            {/* Selected Products */}
            {formData.products_taken.length > 0 && (
              <div className="space-y-2">
                {formData.products_taken.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-md">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="text-sm">{product.product_name} × {product.quantity}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amount Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount_paid">Amount Paid</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount_paid"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount_paid}
                  onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remaining_due">Remaining Due</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="remaining_due"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.remaining_due}
                  onChange={(e) => setFormData({ ...formData, remaining_due: parseFloat(e.target.value) || 0 })}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating Entry..." : "Update Khata Entry"}
          </Button>
        </form>
      </Card>
    </div>
  );
}