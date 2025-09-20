import { Edit, Trash2, Package, TrendingUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardViewProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (productId: string) => void;
  onView?: (product: any) => void;
}

export function ProductCardView({ products, onEdit, onDelete, onView }: ProductCardViewProps) {
  const calculateMargin = (selling: number, cost: number) => {
    return selling > 0 ? ((selling - cost) / selling * 100).toFixed(1) : "0";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="card-white overflow-hidden animate-scale-in hover:scale-105 transition-all duration-300">
          {/* Product Image */}
          <div className="relative h-48 bg-white-frost/30">
            {product.photos && product.photos.length > 0 ? (
              <img
                src={product.photos[0]}
                alt={product.productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white-glass/20">
                <Package className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}
            
            {/* Stock Badge */}
            <div className="absolute top-3 right-3">
              <Badge 
                variant={product.quantity > 10 ? "default" : "destructive"}
                className="bg-white-glass/90 text-background border-white-cool/30 backdrop-blur-sm"
              >
                Stock: {product.quantity || 0}
              </Badge>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-bold text-background text-lg mb-2 line-clamp-2">
              {product.productName}
            </h3>
            
            {/* Pricing Info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="space-y-1">
                <div className="text-xs text-background/60 uppercase tracking-wide">Cost</div>
                <div className="font-semibold text-background">₹{product.costPrice}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-background/60 uppercase tracking-wide">Selling</div>
                <div className="font-semibold text-primary">₹{product.sellingPrice}</div>
              </div>
              
              <div className="col-span-2 space-y-1">
                <div className="text-xs text-background/60 uppercase tracking-wide flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Profit Margin
                </div>
                <div className="font-semibold text-success">
                  {calculateMargin(product.sellingPrice, product.costPrice)}% • ₹{(product.sellingPrice - product.costPrice).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(product)}
                  className="flex-1 hover:bg-primary/20 hover:text-primary border border-white-cool/30"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(product)}
                className="flex-1 hover:bg-primary/20 hover:text-primary border border-white-cool/30"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(product.id)}
                className="hover:bg-destructive/20 hover:text-destructive border border-white-cool/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}