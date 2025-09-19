import { Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductListViewProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (productId: string) => void;
}

export function ProductListView({ products, onEdit, onDelete }: ProductListViewProps) {
  return (
    <div className="space-y-2">
      {products.map((product) => (
        <div key={product.id} className="card-white p-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-4 flex-1">
            {product.photos && product.photos.length > 0 ? (
              <img
                src={product.photos[0]}
                alt={product.productName}
                className="w-12 h-12 object-cover rounded-lg border border-white-cool/30"
              />
            ) : (
              <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center border border-white-cool/30">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="font-semibold text-background">{product.productName}</h3>
              <div className="flex items-center gap-4 text-sm text-background/70">
                <span>Cost: ₹{product.costPrice}</span>
                <span>•</span>
                <span>Selling: ₹{product.sellingPrice}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant={product.quantity > 10 ? "default" : "destructive"}
                className="bg-primary/20 text-primary border-primary/30"
              >
                Stock: {product.quantity || 0}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
              className="hover:bg-primary/20 hover:text-primary"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product.id)}
              className="hover:bg-destructive/20 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}