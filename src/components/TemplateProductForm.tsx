import { useState } from "react";
import { ArrowLeft, Calculator, Package, TrendingUp, CheckCircle, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createProduct } from "@/lib/supabase";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";

interface TemplateProductFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface PricingTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  formula: {
    sellingPriceMultiplier: number;
    lowestPriceMultiplier: number;
    marginPercent: number;
  };
  color: string;
  isCustomizable?: boolean;
}

const PRICING_TEMPLATES: PricingTemplate[] = [
  {
    id: "retail",
    name: "Retail Store",
    description: "Standard retail markup (40% margin)",
    icon: "🏪",
    formula: {
      sellingPriceMultiplier: 1.67, // Cost × 1.67 = 40% margin
      lowestPriceMultiplier: 1.3,   // Cost × 1.3 = 23% margin
      marginPercent: 40
    },
    color: "bg-blue-50 border-blue-200 text-blue-800"
  },
  {
    id: "electronics",
    name: "Electronics",
    description: "Electronics pricing (25% margin)",
    icon: "📱",
    formula: {
      sellingPriceMultiplier: 1.33, // Cost × 1.33 = 25% margin
      lowestPriceMultiplier: 1.15,  // Cost × 1.15 = 13% margin
      marginPercent: 25
    },
    color: "bg-purple-50 border-purple-200 text-purple-800"
  },
  {
    id: "fashion",
    name: "Fashion & Apparel",
    description: "Fashion markup (60% margin)",
    icon: "👕",
    formula: {
      sellingPriceMultiplier: 2.5,  // Cost × 2.5 = 60% margin
      lowestPriceMultiplier: 1.8,   // Cost × 1.8 = 44% margin
      marginPercent: 60
    },
    color: "bg-pink-50 border-pink-200 text-pink-800"
  },
  {
    id: "grocery",
    name: "Grocery & FMCG",
    description: "Low margin, high volume (15% margin)",
    icon: "🛒",
    formula: {
      sellingPriceMultiplier: 1.18, // Cost × 1.18 = 15% margin
      lowestPriceMultiplier: 1.08,  // Cost × 1.08 = 7% margin
      marginPercent: 15
    },
    color: "bg-green-50 border-green-200 text-green-800"
  },
  {
    id: "premium",
    name: "Premium Products",
    description: "Luxury pricing (80% margin)",
    icon: "💎",
    formula: {
      sellingPriceMultiplier: 5,    // Cost × 5 = 80% margin
      lowestPriceMultiplier: 3,     // Cost × 3 = 67% margin
      marginPercent: 80
    },
    color: "bg-amber-50 border-amber-200 text-amber-800"
  },
  {
    id: "custom",
    name: "Custom Template",
    description: "Set your own pricing multipliers",
    icon: "⚙️",
    formula: {
      sellingPriceMultiplier: 2,
      lowestPriceMultiplier: 1.5,
      marginPercent: 50
    },
    color: "bg-gray-50 border-gray-200 text-gray-800",
    isCustomizable: true
  }
];

export function TemplateProductForm({ onBack, onSuccess }: TemplateProductFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<PricingTemplate | null>(null);
  const [productName, setProductName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'template' | 'product'>('template');
  const [customTemplate, setCustomTemplate] = useState<PricingTemplate | null>(null);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customMultiplier, setCustomMultiplier] = useState("2");
  const [customLowestMultiplier, setCustomLowestMultiplier] = useState("1.5");
  
  const { toast } = useToast();
  const { addProductOptimistic, isOnline } = useOfflineStorage();

  const calculatePrices = (cost: number, template: PricingTemplate) => {
    const sellingPrice = Math.round(cost * template.formula.sellingPriceMultiplier);
    const lowestPrice = Math.round(cost * template.formula.lowestPriceMultiplier);
    const actualMargin = ((sellingPrice - cost) / cost * 100).toFixed(1);
    
    return { sellingPrice, lowestPrice, actualMargin };
  };

  const handleTemplateSelect = (template: PricingTemplate) => {
    if (template.isCustomizable) {
      setShowCustomDialog(true);
      return;
    }
    setSelectedTemplate(template);
    setStep('product');
  };

  const handleCustomTemplateCreate = () => {
    const multiplier = parseFloat(customMultiplier);
    const lowestMultiplier = parseFloat(customLowestMultiplier);
    
    if (isNaN(multiplier) || isNaN(lowestMultiplier) || multiplier <= 1 || lowestMultiplier <= 1) {
      toast({
        title: "Invalid Multipliers",
        description: "Please enter valid multipliers greater than 1",
        variant: "destructive"
      });
      return;
    }

    const marginPercent = ((multiplier - 1) * 100).toFixed(0);
    
    const newCustomTemplate: PricingTemplate = {
      id: "custom",
      name: "Custom Template",
      description: `Custom pricing (${marginPercent}% margin)`,
      icon: "⚙️",
      formula: {
        sellingPriceMultiplier: multiplier,
        lowestPriceMultiplier: lowestMultiplier,
        marginPercent: parseInt(marginPercent)
      },
      color: "bg-gray-50 border-gray-200 text-gray-800",
      isCustomizable: true
    };

    setCustomTemplate(newCustomTemplate);
    setSelectedTemplate(newCustomTemplate);
    setShowCustomDialog(false);
    setStep('product');
  };

  const handleAddProduct = async () => {
    if (!selectedTemplate || !productName || !costPrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const cost = parseFloat(costPrice);
    if (isNaN(cost) || cost <= 0) {
      toast({
        title: "Invalid Cost Price",
        description: "Please enter a valid cost price",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { sellingPrice, lowestPrice } = calculatePrices(cost, selectedTemplate);
      
      const databaseProductData = {
        product_name: productName,
        cost_price: cost,
        selling_price: sellingPrice,
        lowest_selling_price: lowestPrice,
        quantity: quantity ? parseInt(quantity) : null,
        discount_percent: null,
        photos: []
      };

      if (isOnline) {
        const newProduct = await createProduct(databaseProductData);
        if (newProduct) {
          toast({
            title: "Product Added",
            description: `${productName} has been added with ${selectedTemplate.name} pricing`,
          });
          onSuccess();
        }
      } else {
        // Convert to camelCase format for offline storage
        const offlineProductData = {
          id: `temp_${Date.now()}`,
          productName: productName,
          costPrice: cost,
          sellingPrice: sellingPrice,
          lowestSellingPrice: lowestPrice,
          photos: [],
        };
        await addProductOptimistic(offlineProductData);
        toast({
          title: "Product Added (Offline)",
          description: `${productName} will be synced when you're back online`,
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'template') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gradient">Choose Pricing Template</h2>
            <p className="text-muted-foreground">Select a template that matches your business type</p>
          </div>
        </div>

        {/* Templates */}
        <div className="space-y-4">
          {PRICING_TEMPLATES.map((template) => (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:shadow-md transition-all duration-200 hover:glow-primary"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{template.icon}</div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {template.name}
                        {template.isCustomizable && <Settings className="h-4 w-4 text-muted-foreground" />}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className={template.color}>
                    {template.isCustomizable ? "Customizable" : `${template.formula.marginPercent}% margin`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-muted-foreground">Selling Price</div>
                    <div className="font-semibold">
                      {template.isCustomizable ? "Cost × Custom" : `Cost × ${template.formula.sellingPriceMultiplier}`}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Lowest Price</div>
                    <div className="font-semibold">
                      {template.isCustomizable ? "Cost × Custom" : `Cost × ${template.formula.lowestPriceMultiplier}`}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Target Margin</div>
                    <div className="font-semibold text-success">
                      {template.isCustomizable ? "Custom%" : `${template.formula.marginPercent}%`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Template Dialog */}
        <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Customize Pricing Template
              </DialogTitle>
              <DialogDescription>
                Set your own multipliers for calculating selling and lowest prices
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sellingMultiplier">Selling Price Multiplier</Label>
                <Input
                  id="sellingMultiplier"
                  type="number"
                  step="0.1"
                  min="1.1"
                  value={customMultiplier}
                  onChange={(e) => setCustomMultiplier(e.target.value)}
                  placeholder="e.g., 2.0"
                />
                <p className="text-xs text-muted-foreground">
                  Selling Price = Cost Price × {customMultiplier || "2.0"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lowestMultiplier">Lowest Price Multiplier</Label>
                <Input
                  id="lowestMultiplier"
                  type="number"
                  step="0.1"
                  min="1.1"
                  value={customLowestMultiplier}
                  onChange={(e) => setCustomLowestMultiplier(e.target.value)}
                  placeholder="e.g., 1.5"
                />
                <p className="text-xs text-muted-foreground">
                  Lowest Price = Cost Price × {customLowestMultiplier || "1.5"}
                </p>
              </div>

              {/* Preview */}
              {customMultiplier && customLowestMultiplier && (
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-2">Preview (Cost: ₹100)</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Selling Price</div>
                      <div className="font-semibold">₹{(100 * parseFloat(customMultiplier || "2")).toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Lowest Price</div>
                      <div className="font-semibold">₹{(100 * parseFloat(customLowestMultiplier || "1.5")).toFixed(0)}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <Badge variant="outline">
                      {((parseFloat(customMultiplier || "2") - 1) * 100).toFixed(0)}% margin
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCustomTemplateCreate}>
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Product entry step
  const cost = parseFloat(costPrice) || 0;
  const calculatedPrices = selectedTemplate && cost > 0 ? calculatePrices(cost, selectedTemplate) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setStep('template')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gradient">Add Product</h2>
          <p className="text-muted-foreground">
            Using {selectedTemplate?.name} template {selectedTemplate?.icon}
          </p>
        </div>
      </div>

      {/* Selected Template Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calculator className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Template: {selectedTemplate?.name}</div>
              <div className="text-sm text-muted-foreground">{selectedTemplate?.description}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price * (₹)</Label>
            <Input
              id="costPrice"
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="Enter cost price"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (Optional)</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>
        </CardContent>
      </Card>

      {/* Price Preview */}
      {calculatedPrices && (
        <Card className="bg-success/5 border-success/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <TrendingUp className="h-5 w-5" />
              Calculated Prices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Selling Price</div>
                <div className="text-xl font-bold text-primary">₹{calculatedPrices.sellingPrice}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Lowest Price</div>
                <div className="text-lg font-semibold">₹{calculatedPrices.lowestPrice}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Profit Margin</div>
                <div className="text-lg font-semibold text-success">{calculatedPrices.actualMargin}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={handleAddProduct} 
          disabled={!productName || !costPrice || isLoading}
          className="flex-1"
        >
          {isLoading ? "Adding..." : "Add Product"}
          <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}