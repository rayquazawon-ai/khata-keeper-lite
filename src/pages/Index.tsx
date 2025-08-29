import { useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { InventoryTab } from "@/components/InventoryTab";
import { KhataTab } from "@/components/KhataTab";
import { AddTab } from "@/components/AddTab";

const Index = () => {
  const [activeTab, setActiveTab] = useState("inventory");

  const renderTabContent = () => {
    switch (activeTab) {
      case "inventory":
        return <InventoryTab />;
      case "khata":
        return <KhataTab />;
      case "add":
        return <AddTab />;
      default:
        return <InventoryTab />;
    }
  };

  return (
    <MobileLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </MobileLayout>
  );
};

export default Index;
