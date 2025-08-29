import { Package, UserPlus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddProductForm } from "@/components/AddProductForm";
import { AddCustomerForm } from "@/components/AddCustomerForm";

export function AddTab() {
  const [currentView, setCurrentView] = useState<'main' | 'add-product' | 'add-customer'>('main');

  const handleAddProduct = () => {
    setCurrentView('add-product');
  };

  const handleAddCustomer = () => {
    setCurrentView('add-customer');
  };

  const handleBack = () => {
    setCurrentView('main');
  };

  const handleSuccess = () => {
    setCurrentView('main');
  };

  if (currentView === 'add-product') {
    return <AddProductForm onBack={handleBack} onSuccess={handleSuccess} />;
  }

  if (currentView === 'add-customer') {
    return <AddCustomerForm onBack={handleBack} onSuccess={handleSuccess} />;
  }

  const quickActions = [
    {
      title: "Add Product",
      description: "Add a new item to inventory",
      icon: Package,
      action: handleAddProduct,
      color: "bg-primary/10 text-primary border-primary/20"
    },
    {
      title: "Add Customer",
      description: "Register a new customer",
      icon: UserPlus,
      action: handleAddCustomer,
      color: "bg-accent/10 text-accent border-accent/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gradient mb-2">Quick Actions</h2>
        <p className="text-muted-foreground">Add new items to your store</p>
      </div>

      {/* Quick Action Cards */}
      <div className="space-y-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          
          return (
            <div
              key={action.title}
              className="card-electric p-6 cursor-pointer hover:glow-primary transition-all duration-300"
              onClick={action.action}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${action.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                
                <div className="text-muted-foreground">→</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="card-electric p-4">
        <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">LED Bulb added</span>
            <span className="text-xs text-muted-foreground">2 hours ago</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Ramesh Kumar - ₹125 paid</span>
            <span className="text-xs text-muted-foreground">1 day ago</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Extension Cord sold</span>
            <span className="text-xs text-muted-foreground">2 days ago</span>
          </div>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">Pro Tip</h4>
            <p className="text-sm text-muted-foreground">
              Keep your inventory updated with quantities to get low-stock alerts and better manage your business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}