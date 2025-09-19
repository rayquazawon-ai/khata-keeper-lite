import { Grid3X3, List, Table2, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "grid" | "list" | "table" | "cards";

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const viewOptions = [
    { id: "grid" as ViewMode, label: "Grid", icon: Grid3X3 },
    { id: "list" as ViewMode, label: "List", icon: List },
    { id: "table" as ViewMode, label: "Table", icon: Table2 },
    { id: "cards" as ViewMode, label: "Cards", icon: LayoutGrid },
  ];

  return (
    <div className="view-switcher">
      {viewOptions.map((option) => {
        const Icon = option.icon;
        const isActive = currentView === option.id;
        
        return (
          <Button
            key={option.id}
            variant="ghost"
            size="sm"
            className={`view-option ${isActive ? "active" : ""}`}
            onClick={() => onViewChange(option.id)}
            title={option.label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}