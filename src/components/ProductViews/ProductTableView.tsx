import { Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductTableViewProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (productId: string) => void;
}

export function ProductTableView({ products, onEdit, onDelete }: ProductTableViewProps) {
  return (
    <div className="card-white overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white-cool/20 bg-white-frost/50">
            <TableHead className="text-background font-semibold">Product</TableHead>
            <TableHead className="text-background font-semibold">Cost Price</TableHead>
            <TableHead className="text-background font-semibold">Selling Price</TableHead>
            <TableHead className="text-background font-semibold">Lowest Price</TableHead>
            <TableHead className="text-background font-semibold">Stock</TableHead>
            <TableHead className="text-background font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="border-b border-white-cool/10 hover:bg-white-frost/20 transition-colors">
              <TableCell className="flex items-center gap-3">
                {product.photos && product.photos.length > 0 ? (
                  <img
                    src={product.photos[0]}
                    alt={product.productName}
                    className="w-10 h-10 object-cover rounded-lg border border-white-cool/30"
                  />
                ) : (
                  <div className="w-10 h-10 bg-muted/20 rounded-lg flex items-center justify-center border border-white-cool/30">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-background">{product.productName}</div>
                  <div className="text-sm text-background/60">ID: {product.id.slice(0, 8)}...</div>
                </div>
              </TableCell>
              
              <TableCell className="text-background">₹{product.costPrice}</TableCell>
              <TableCell className="text-background">₹{product.sellingPrice}</TableCell>
              <TableCell className="text-background">₹{product.lowestSellingPrice}</TableCell>
              
              <TableCell>
                <Badge 
                  variant={product.quantity > 10 ? "default" : "destructive"}
                  className="bg-primary/20 text-primary border-primary/30"
                >
                  {product.quantity || 0}
                </Badge>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex items-center gap-2 justify-end">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}