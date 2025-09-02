import { Calendar, IndianRupee, Package, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KhataEntry } from "@/lib/supabase";

interface KhataEntryCardProps {
  entry: KhataEntry;
  onEdit: (entry: KhataEntry) => void;
  onDelete: (entryId: string) => void;
}

export function KhataEntryCard({ entry, onEdit, onDelete }: KhataEntryCardProps) {
  const entryDate = entry.date ? new Date(entry.date) : null;
  
  return (
    <Card className="card-electric p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div>
            {entryDate && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{entryDate.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(entry)}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(entry.id)}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Products taken */}
      {entry.products_taken && Array.isArray(entry.products_taken) && entry.products_taken.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-foreground mb-2">Products Taken:</h4>
          <div className="space-y-1">
            {entry.products_taken.map((product: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {product.product_name} × {product.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amount details */}
      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-success font-semibold">
            <IndianRupee className="h-4 w-4" />
            <span>{(entry.amount_paid || 0).toFixed(2)}</span>
          </div>
          <div className="text-xs text-muted-foreground">Paid</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-warning font-semibold">
            <IndianRupee className="h-4 w-4" />
            <span>{(entry.remaining_due || 0).toFixed(2)}</span>
          </div>
          <div className="text-xs text-muted-foreground">Due</div>
        </div>
      </div>
    </Card>
  );
}