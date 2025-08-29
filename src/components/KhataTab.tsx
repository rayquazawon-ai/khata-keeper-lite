import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { CustomerCard } from "./CustomerCard";

// Mock data - in real app this would come from your backend
const mockCustomers = [
  {
    id: "1",
    customerName: "Ramesh Kumar",
    customerPhone: "+91 98765 43210",
    totalDues: 1250.50,
    lastEntry: new Date("2024-01-15")
  },
  {
    id: "2",
    customerName: "Priya Electronics Store",
    customerPhone: "+91 87654 32109",
    totalDues: 0,
    lastEntry: new Date("2024-01-12")
  },
  {
    id: "3",
    customerName: "Suresh Electrical Works",
    customerPhone: "+91 76543 21098",
    totalDues: 875.25,
    lastEntry: new Date("2024-01-10")
  },
  {
    id: "4",
    customerName: "Home Depot Solutions",
    customerPhone: "+91 65432 10987",
    totalDues: 2150.00,
    lastEntry: new Date("2024-01-08")
  }
];

export function KhataTab() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredCustomers = mockCustomers.filter(customer =>
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerPhone.includes(searchTerm)
  );

  const totalDues = mockCustomers.reduce((sum, customer) => sum + customer.totalDues, 0);
  const customersWithDues = mockCustomers.filter(c => c.totalDues > 0).length;

  const handleCustomerClick = (customer: any) => {
    // TODO: Navigate to customer details screen
    console.log("View customer:", customer);
  };

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
      <div className="space-y-3">
        {filteredCustomers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onClick={handleCustomerClick}
          />
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No customers found</p>
        </div>
      )}
    </div>
  );
}