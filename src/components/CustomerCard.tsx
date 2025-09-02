import { User, Phone, IndianRupee, Clock, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Customer } from "@/lib/supabase";

interface CustomerCardProps {
  customer: Customer;
  onClick: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customerId: string) => void;
}

export function CustomerCard({ customer, onClick, onEdit, onDelete }: CustomerCardProps) {
  const hasDues = (customer.total_dues || 0) > 0;
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when action buttons are clicked
    if ((e.target as Element).closest('.action-button')) return;
    onClick(customer);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(customer);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(customer.id);
  };

  return (
    <div 
      className="card-electric p-4 cursor-pointer hover:glow-primary transition-all duration-300 animate-slide-up"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3" onClick={() => onClick(customer)}>
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground">{customer.customer_name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Phone className="h-3 w-3" />
              <span>{customer.customer_phone}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>Added: {new Date(customer.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <div className={`font-bold text-lg ${
              hasDues ? "text-warning" : "text-success"
            }`}>
              ₹{(customer.total_dues || 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {hasDues ? "Dues" : "Clear"}
            </div>
          </div>
          
          {(onEdit || onDelete) && (
            <div className="flex flex-col gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="action-button h-8 w-8 p-0 hover:bg-primary/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="action-button h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}