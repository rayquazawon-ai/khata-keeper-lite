import { useState, useEffect } from "react";
import { ArrowLeft, Plus, User, Phone, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getKhataEntriesByCustomer, deleteKhataEntry, Customer, KhataEntry } from "@/lib/supabase";
import { KhataEntryCard } from "./KhataEntryCard";
import { AddKhataEntryForm } from "./AddKhataEntryForm";
import { EditKhataEntryForm } from "./EditKhataEntryForm";

interface CustomerDetailsViewProps {
  customer: Customer;
  onBack: () => void;
  onEditCustomer: (customer: Customer) => void;
}

export function CustomerDetailsView({ customer, onBack, onEditCustomer }: CustomerDetailsViewProps) {
  const [entries, setEntries] = useState<KhataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'details' | 'add-entry' | 'edit-entry'>('details');
  const [selectedEntry, setSelectedEntry] = useState<KhataEntry | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadKhataEntries();
  }, [customer.id]);

  const loadKhataEntries = async () => {
    try {
      setLoading(true);
      const data = await getKhataEntriesByCustomer(customer.id);
      // Ensure we handle the data properly
      setEntries(data || []);
    } catch (error) {
      console.error("Error loading khata entries:", error);
      toast({
        title: "Error",
        description: "Failed to load khata entries.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      await deleteKhataEntry(entryId);
      toast({
        title: "Entry Deleted",
        description: "Khata entry has been deleted successfully.",
      });
      await loadKhataEntries();
    } catch (error) {
      console.error("Error deleting khata entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete khata entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditEntry = (entry: KhataEntry) => {
    setSelectedEntry(entry);
    setCurrentView('edit-entry');
  };

  const handleEntrySuccess = async () => {
    setCurrentView('details');
    setSelectedEntry(null);
    await loadKhataEntries();
  };

  // Show add entry form
  if (currentView === 'add-entry') {
    return (
      <AddKhataEntryForm
        customer={customer}
        onBack={() => setCurrentView('details')}
        onSuccess={handleEntrySuccess}
      />
    );
  }

  // Show edit entry form
  if (currentView === 'edit-entry' && selectedEntry) {
    return (
      <EditKhataEntryForm
        entry={selectedEntry}
        onBack={() => setCurrentView('details')}
        onSuccess={handleEntrySuccess}
      />
    );
  }

  // Calculate totals
  const totalPaid = entries.reduce((sum, entry) => sum + (entry.amount_paid || 0), 0);
  const totalDue = entries.reduce((sum, entry) => sum + (entry.remaining_due || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gradient">Customer Details</h2>
          <p className="text-muted-foreground">Khata entries and transactions</p>
        </div>
        <Button onClick={() => onEditCustomer(customer)} variant="outline">
          Edit Customer
        </Button>
      </div>

      {/* Customer Info Card */}
      <Card className="card-electric p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground">{customer.customer_name}</h3>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Phone className="h-4 w-4" />
              <span>{customer.customer_phone}</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-success font-bold text-lg">
              <IndianRupee className="h-5 w-5" />
              <span>{totalPaid.toFixed(2)}</span>
            </div>
            <div className="text-sm text-muted-foreground">Total Paid</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-warning font-bold text-lg">
              <IndianRupee className="h-5 w-5" />
              <span>{totalDue.toFixed(2)}</span>
            </div>
            <div className="text-sm text-muted-foreground">Total Due</div>
          </div>
          <div className="text-center">
            <div className="text-primary font-bold text-lg">{entries.length}</div>
            <div className="text-sm text-muted-foreground">Entries</div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Khata Entries</h3>
        <Button onClick={() => setCurrentView('add-entry')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Entry
        </Button>
      </div>

      {/* Khata Entries */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No khata entries found for this customer.</p>
          <Button 
            onClick={() => setCurrentView('add-entry')} 
            variant="outline" 
            className="mt-4"
          >
            Add First Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <KhataEntryCard
              key={entry.id}
              entry={entry}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          ))}
        </div>
      )}
    </div>
  );
}