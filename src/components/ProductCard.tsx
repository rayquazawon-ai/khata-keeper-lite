import { Package, Camera, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  productName: string;
  costPrice: number;
  sellingPrice: number;
  lowestSellingPrice: number;
  quantity?: number;
  photos?: string[];
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onAddToKhata: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onAddToKhata }: ProductCardProps) {
  const hasLowStock = product.quantity !== undefined && product.quantity < 5;
  const isOutOfStock = product.quantity !== undefined && product.quantity === 0;
  const hasPhoto = product.photos && product.photos.length > 0;

  return (
    <div className="card-electric p-4 hover:glow-primary transition-all duration-300 animate-fade-in">
      {/* Product Image */}
      <div className="aspect-square rounded-lg bg-secondary/30 mb-3 flex items-center justify-center overflow-hidden">
        {hasPhoto ? (
          <img 
            src={product.photos![0]} 
            alt={product.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-muted-foreground animate-scale-in">
            <Camera className="h-8 w-8 mb-2" />
            <span className="text-xs">No Photo</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground line-clamp-2">
          {product.productName}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-primary font-bold">₹{product.sellingPrice}</span>
          {product.quantity !== undefined && (
            <span className={
              isOutOfStock ? "status-low-stock" : 
              hasLowStock ? "status-low-stock" : 
              "status-in-stock"
            }>
              {isOutOfStock ? "Out of Stock" : 
               hasLowStock ? `${product.quantity} left` : 
               `${product.quantity} in stock`}
            </span>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>Cost: ₹{product.costPrice}</div>
          <div>Min Price: ₹{product.lowestSellingPrice}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline" 
          size="sm"
          onClick={() => onEdit(product)}
          className="flex-1"
        >
          <Edit3 className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onAddToKhata(product)}
          className="flex-1 btn-primary"
        >
          <Package className="h-4 w-4 mr-1" />
          Sell
        </Button>
      </div>
    </div>
  );
}