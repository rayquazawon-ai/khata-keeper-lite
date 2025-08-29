import { User, Phone, IndianRupee, Clock } from "lucide-react";

interface Customer {
  id: string;
  customerName: string;
  customerPhone: string;
  totalDues: number;
  lastEntry?: Date;
}

interface CustomerCardProps {
  customer: Customer;
  onClick: (customer: Customer) => void;
}

export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  const hasDues = customer.totalDues > 0;
  
  return (
    <div 
      className="card-electric p-4 cursor-pointer hover:glow-primary transition-all duration-300 animate-slide-up"
      onClick={() => onClick(customer)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground">{customer.customerName}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Phone className="h-3 w-3" />
              <span>{customer.customerPhone}</span>
            </div>
            {customer.lastEntry && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                <span>Last: {customer.lastEntry.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className={`font-bold text-lg ${
            hasDues ? "text-warning" : "text-success"
          }`}>
            ₹{customer.totalDues.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            {hasDues ? "Dues" : "Clear"}
          </div>
        </div>
      </div>
    </div>
  );
}