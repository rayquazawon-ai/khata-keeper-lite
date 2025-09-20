import { ArrowLeft, Edit, Trash2, Package, TrendingUp, DollarSign, Tag, Calendar, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/supabase";
import { format } from "date-fns";

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export function ProductDetailView({ product, onBack, onEdit, onDelete }: ProductDetailViewProps) {
  const calculateMargin = (selling: number, cost: number) => {
    return (((selling - cost) / cost) * 100).toFixed(1);
  };

  const calculateProfit = (selling: number, cost: number) => {
    return (selling - cost).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gradient">Product Details</h2>
            <p className="text-muted-foreground">Complete product information</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(product.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Product Images */}
      {product.photos && product.photos.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Product Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {product.photos.map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                  <img 
                    src={photo} 
                    alt={`${product.product_name} - Image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No images uploaded</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product.product_name}
          </CardTitle>
          <CardDescription>
            Added on {format(new Date(product.created_at), 'PPP')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cost & Selling Price */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-muted-foreground">Cost Price</span>
                </div>
                <span className="font-semibold text-destructive">₹{product.cost_price}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Selling Price</span>
                </div>
                <span className="font-semibold text-primary">₹{product.selling_price}</span>
              </div>
            </div>

            {/* Lowest Price & Profit Analysis */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  <span className="text-sm text-muted-foreground">Lowest Selling Price</span>
                </div>
                <span className="font-semibold text-secondary">₹{product.lowest_selling_price}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm text-muted-foreground">Profit Margin</span>
                </div>
                <span className="font-semibold text-success">
                  {calculateMargin(product.selling_price, product.cost_price)}%
                </span>
              </div>
            </div>
          </div>

          {/* Profit Analysis */}
          <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-xl p-6 border border-success/20">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Profit Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  ₹{calculateProfit(product.selling_price, product.cost_price)}
                </div>
                <div className="text-sm text-muted-foreground">Profit per unit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  ₹{calculateProfit(product.lowest_selling_price, product.cost_price)}
                </div>
                <div className="text-sm text-muted-foreground">Minimum profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {calculateMargin(product.lowest_selling_price, product.cost_price)}%
                </div>
                <div className="text-sm text-muted-foreground">Min margin</div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stock Information */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stock Quantity</span>
                {product.quantity !== null ? (
                  <Badge variant={product.quantity > 10 ? "default" : "destructive"}>
                    {product.quantity} units
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not tracked</Badge>
                )}
              </div>
            </div>

            {/* Discount Information */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Discount Percentage</span>
                {product.discount_percent !== null ? (
                  <Badge variant="outline">{product.discount_percent}%</Badge>
                ) : (
                  <Badge variant="secondary">No discount</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created: {format(new Date(product.created_at), 'PPp')}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Updated: {format(new Date(product.updated_at), 'PPp')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}