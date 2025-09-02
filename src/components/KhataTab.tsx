import { useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";
import { CustomerCard } from "./CustomerCard";
import { CustomerDetailsView } from "./CustomerDetailsView";
import { EditCustomerForm } from "./EditCustomerForm";
import { getCustomers, deleteCustomer, Customer } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function KhataTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'edit'>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredCustomers = customers.filter(customer =>
    customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDues = customers.reduce((sum, customer) => sum + (customer.total_dues || 0), 0);
  const customersWithDues = customers.filter(c => (c.total_dues || 0) > 0).length;

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('details');
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('edit');
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer? All their khata entries will also be deleted.")) return;

    try {
      await deleteCustomer(customerId);
      toast({
        title: "Customer Deleted",
        description: "Customer has been deleted successfully.",
      });
      await loadCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSuccess = async () => {
    setCurrentView('list');
    setSelectedCustomer(null);
    await loadCustomers();
  };

  // Show customer details
  if (currentView === 'details' && selectedCustomer) {
    return (
      <CustomerDetailsView
        customer={selectedCustomer}
        onBack={() => setCurrentView('list')}
        onEditCustomer={handleEditCustomer}
      />
    );
  }

  // Show edit customer form
  if (currentView === 'edit' && selectedCustomer) {
    return (
      <EditCustomerForm
        customer={selectedCustomer}
        onBack={() => setCurrentView('list')}
        onSuccess={handleSuccess}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Khata Book</h2>
        <p className="text-muted-foreground">Customer accounts & dues</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-electric p-4 text-center">
          <div className="text-2xl font-bold text-warning">₹{totalDues.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Total Dues</div>
        </div>
        <div className="card-electric p-4 text-center">
          <div className="text-2xl font-bold text-primary">{customersWithDues}</div>
          <div className="text-sm text-muted-foreground">Pending Accounts</div>
        </div>
      </div>

      {/* Search */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search customers..."
      />

      {/* Customer List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onClick={handleCustomerClick}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
            />
          ))}
        </div>
      )}

      {!loading && filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {customers.length === 0 ? "No customers found. Add your first customer!" : "No customers match your search."}
          </p>
        </div>
      )}
    </div>
  );
}