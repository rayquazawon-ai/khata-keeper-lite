import { useState } from "react";
import { ArrowLeft, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createCustomer } from "@/lib/supabase";

interface AddCustomerFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function AddCustomerForm({ onBack, onSuccess }: AddCustomerFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.customer_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.customer_phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer phone is required.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format (basic)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.customer_phone.replace(/\D/g, ''))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await createCustomer({
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone
      });

      toast({
        title: "Customer Added",
        description: `${formData.customer_name} has been registered successfully.`,
      });

      onSuccess();
    } catch (error) {
      console.error("Error creating customer:", error);
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gradient">Add New Customer</h2>
          <p className="text-muted-foreground">Register a new customer</p>
        </div>
      </div>

      {/* Form */}
      <Card className="card-electric p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Info Card */}
          <Card className="bg-primary/5 border-primary/20 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Customer Account</h4>
                <p className="text-sm text-muted-foreground">
                  A new khata (account) will be created for this customer where you can track their purchases and dues.
                </p>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding Customer..." : "Add Customer"}
          </Button>
        </form>
      </Card>
    </div>
  );
}