import { Package, Users, Plus, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "add", label: "Add", icon: Plus },
];

export function MobileLayout({ children, activeTab, onTabChange }: MobileLayoutProps) {

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gradient">StoreKeeper</h1>
          <p className="text-xs text-muted-foreground">Electric Inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <Search className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border mobile-safe-area">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "tab-item",
                  isActive && "active"
                )}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}