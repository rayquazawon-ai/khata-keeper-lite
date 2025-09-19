import { Package, Zap, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AddProductForm } from "@/components/AddProductForm";
import { BulkProductSpreadsheet } from "@/components/BulkProductSpreadsheet";
import { supabase } from "@/integrations/supabase/client";

export function AddTab() {
  const [currentView, setCurrentView] = useState<'main' | 'add-product' | 'bulk-spreadsheet'>('main');
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Fetch recent activity from database
  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      // Get recent products
      const { data: products } = await supabase
        .from('products')
        .select('product_name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      // Transform to activity format
      const activities = products?.map(product => ({
        type: 'product_added',
        description: `${product.product_name} added`,
        timestamp: new Date(product.created_at).toLocaleString()
      })) || [];

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const handleAddProduct = () => {
    setCurrentView('add-product');
  };

  const handleBulkAdd = () => {
    setCurrentView('bulk-spreadsheet');
  };

  const handleBack = () => {
    setCurrentView('main');
  };

  const handleSuccess = () => {
    setCurrentView('main');
    // Refresh recent activity after adding a product
    fetchRecentActivity();
  };

  if (currentView === 'add-product') {
    return <AddProductForm onBack={handleBack} onSuccess={handleSuccess} />;
  }

  if (currentView === 'bulk-spreadsheet') {
    return <BulkProductSpreadsheet onBack={handleBack} onSuccess={handleSuccess} />;
  }

  const quickActions = [
    {
      title: "Add Single Product",
      description: "Add one item with photos",
      icon: Package,
      action: handleAddProduct,
      color: "bg-primary/10 text-primary border-primary/20"
    },
    {
      title: "Bulk Add (Excel-like)",
      description: "Add multiple products with formulas",
      icon: Table,
      action: handleBulkAdd,
      color: "bg-secondary/10 text-secondary border-secondary/20"
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
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
                <span className="text-muted-foreground">{activity.description}</span>
                <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No recent activity
            </div>
          )}
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