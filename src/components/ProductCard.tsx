import { Trash2, Camera, Edit3, Eye } from "lucide-react";
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
  onDelete: (productId: string) => void;
  onView?: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete, onView }: ProductCardProps) {
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
            <span className={`text-xs px-2 py-1 rounded ${product.quantity > 10 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
              Stock: {product.quantity}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {onView && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(product)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        )}
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
          variant="destructive"
          size="sm"
          onClick={() => onDelete(product.id)}
          className="flex-1"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
}