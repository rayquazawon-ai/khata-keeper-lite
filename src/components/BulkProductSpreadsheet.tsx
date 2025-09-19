import { useState, useCallback } from "react";
import { ArrowLeft, Download, Upload, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createProduct } from "@/lib/supabase";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";

interface BulkProductSpreadsheetProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface ProductRow {
  id: string;
  product_name: string;
  cost_price: number | string;
  selling_price: number | string;
  lowest_selling_price: number | string;
  discount_percent: number | string;
  margin?: number | string;
  profit?: number | string;
}

export function BulkProductSpreadsheet({ onBack, onSuccess }: BulkProductSpreadsheetProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isOnline, addProductOptimistic } = useOfflineStorage();

  const [rows, setRows] = useState<ProductRow[]>([
    {
      id: crypto.randomUUID(),
      product_name: "",
      cost_price: "",
      selling_price: "",
      lowest_selling_price: "",
      discount_percent: "",
    },
    {
      id: crypto.randomUUID(),
      product_name: "",
      cost_price: "",
      selling_price: "",
      lowest_selling_price: "",
      discount_percent: "",
    },
    {
      id: crypto.randomUUID(),
      product_name: "",
      cost_price: "",
      selling_price: "",
      lowest_selling_price: "",
      discount_percent: "",
    }
  ]);

  // Formula evaluator for simple calculations
  const evaluateFormula = useCallback((formula: string, row: ProductRow): number | string => {
    if (!formula.toString().startsWith('=')) return formula;
    
    const expression = formula.substring(1).toLowerCase();
    const cost = parseFloat(row.cost_price.toString()) || 0;
    const selling = parseFloat(row.selling_price.toString()) || 0;
    const lowest = parseFloat(row.lowest_selling_price.toString()) || 0;
    
    try {
      // Replace field references with actual values
      let evalExpression = expression
        .replace(/cost_price|cost/g, cost.toString())
        .replace(/selling_price|selling/g, selling.toString())
        .replace(/lowest_selling_price|lowest/g, lowest.toString());
      
      // Simple formula patterns
      if (evalExpression.includes('margin')) {
        return selling > 0 ? ((selling - cost) / selling * 100).toFixed(2) : "0";
      }
      
      if (evalExpression.includes('profit')) {
        return (selling - cost).toFixed(2);
      }
      
      // Basic math evaluation (limited for security)
      const mathResult = Function(`"use strict"; return (${evalExpression})`)();
      return typeof mathResult === 'number' ? mathResult.toFixed(2) : mathResult;
    } catch (error) {
      return "ERROR";
    }
  }, []);

  const updateCell = (rowId: string, field: keyof ProductRow, value: string | number) => {
    setRows(prevRows => 
      prevRows.map(row => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value };
          
          // Auto-calculate formulas for derived fields
          if (['cost_price', 'selling_price'].includes(field)) {
            const cost = parseFloat(updatedRow.cost_price.toString()) || 0;
            const selling = parseFloat(updatedRow.selling_price.toString()) || 0;
            
            updatedRow.margin = selling > 0 ? ((selling - cost) / selling * 100).toFixed(1) : "";
            updatedRow.profit = (selling - cost).toFixed(2);
          }
          
          return updatedRow;
        }
        return row;
      })
    );
  };

  const addRow = () => {
    setRows(prev => [...prev, {
      id: crypto.randomUUID(),
      product_name: "",
      cost_price: "",
      selling_price: "",
      lowest_selling_price: "",
      discount_percent: "",
    }]);
  };

  const deleteRow = (rowId: string) => {
    if (rows.length > 1) {
      setRows(prev => prev.filter(row => row.id !== rowId));
    }
  };

  const validateRow = (row: ProductRow): string | null => {
    if (!row.product_name.toString().trim()) return "Product name required";
    if (!row.cost_price || parseFloat(row.cost_price.toString()) <= 0) return "Valid cost price required";
    if (!row.selling_price || parseFloat(row.selling_price.toString()) <= 0) return "Valid selling price required";
    if (!row.lowest_selling_price || parseFloat(row.lowest_selling_price.toString()) <= 0) return "Valid lowest price required";
    if (parseFloat(row.selling_price.toString()) < parseFloat(row.lowest_selling_price.toString())) {
      return "Selling price cannot be lower than lowest price";
    }
    return null;
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const validRows = rows.filter(row => row.product_name.toString().trim());
      
      if (validRows.length === 0) {
        toast({
          title: "No Data",
          description: "Add at least one product to save.",
          variant: "destructive",
        });
        return;
      }

      let errors: string[] = [];
      let successCount = 0;

      for (const row of validRows) {
        const error = validateRow(row);
        if (error) {
          errors.push(`Row ${validRows.indexOf(row) + 1}: ${error}`);
          continue;
        }

        const productData = {
          product_name: row.product_name.toString(),
          cost_price: parseFloat(row.cost_price.toString()),
          selling_price: parseFloat(row.selling_price.toString()),
          lowest_selling_price: parseFloat(row.lowest_selling_price.toString()),
          discount_percent: row.discount_percent ? parseFloat(row.discount_percent.toString()) : undefined,
          quantity: null,
          photos: [] as string[]
        };

        try {
          if (isOnline) {
            await createProduct(productData);
          } else {
            // Add optimistically for offline mode
            const optimisticProduct = {
              id: crypto.randomUUID(),
              productName: productData.product_name,
              costPrice: productData.cost_price,
              sellingPrice: productData.selling_price,
              lowestSellingPrice: productData.lowest_selling_price,
              photos: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            addProductOptimistic(optimisticProduct);
          }
          
          successCount++;
        } catch (error) {
          errors.push(`Row ${validRows.indexOf(row) + 1}: Failed to save`);
        }
      }

      if (successCount > 0) {
        toast({
          title: "Products Added",
          description: `${successCount} product(s) added successfully.${!isOnline ? " Will sync when online." : ""}`,
        });
      }

      if (errors.length > 0) {
        toast({
          title: "Some Errors",
          description: `${errors.length} rows had issues. Check the data.`,
          variant: "destructive",
        });
      }

      if (successCount > 0 && errors.length === 0) {
        onSuccess();
      }
    } catch (error) {
      console.error("Bulk save error:", error);
      toast({
        title: "Error",
        description: "Failed to save products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportTemplate = () => {
    const csv = [
      "Product Name,Cost Price,Selling Price,Lowest Price,Discount %",
      "Sample Product,100,150,120,5",
      "Another Product,50,75,60,10"
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gradient">Bulk Add Products</h2>
            <p className="text-muted-foreground">Excel-like interface with formulas</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
          <Button onClick={addRow} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      {/* Formula Help */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <h4 className="font-medium text-foreground mb-2">Formula Examples:</h4>
        <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
          <div>• <code>=selling - cost</code> (Profit)</div>
          <div>• <code>=margin</code> (Auto margin %)</div>
          <div>• <code>=cost * 1.5</code> (50% markup)</div>
          <div>• <code>=profit</code> (Auto profit amount)</div>
        </div>
      </Card>

      {/* Spreadsheet */}
      <Card className="card-electric overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-medium text-foreground min-w-[200px]">Product Name *</th>
                <th className="p-3 text-left font-medium text-foreground min-w-[120px]">Cost Price *</th>
                <th className="p-3 text-left font-medium text-foreground min-w-[120px]">Selling Price *</th>
                <th className="p-3 text-left font-medium text-foreground min-w-[120px]">Lowest Price *</th>
                <th className="p-3 text-left font-medium text-foreground min-w-[120px]">Discount %</th>
                <th className="p-3 text-left font-medium text-foreground min-w-[100px]">Margin %</th>
                <th className="p-3 text-left font-medium text-foreground min-w-[100px]">Profit ₹</th>
                <th className="p-3 text-center font-medium text-foreground w-[50px]">Del</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-t border-border/50 hover:bg-muted/20">
                  <td className="p-2">
                    <Input
                      value={row.product_name}
                      onChange={(e) => updateCell(row.id, 'product_name', e.target.value)}
                      placeholder="Enter product name..."
                      className="border-none bg-transparent focus-visible:ring-1"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={row.cost_price}
                      onChange={(e) => updateCell(row.id, 'cost_price', e.target.value)}
                      placeholder="₹0.00"
                      className="border-none bg-transparent focus-visible:ring-1"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={row.selling_price}
                      onChange={(e) => updateCell(row.id, 'selling_price', e.target.value)}
                      placeholder="₹0.00"
                      className="border-none bg-transparent focus-visible:ring-1"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={row.lowest_selling_price}
                      onChange={(e) => updateCell(row.id, 'lowest_selling_price', e.target.value)}
                      placeholder="₹0.00"
                      className="border-none bg-transparent focus-visible:ring-1"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={row.discount_percent}
                      onChange={(e) => updateCell(row.id, 'discount_percent', e.target.value)}
                      placeholder="0%"
                      className="border-none bg-transparent focus-visible:ring-1"
                    />
                  </td>
                  <td className="p-2">
                    <div className="px-2 py-1 text-sm text-muted-foreground bg-muted/30 rounded">
                      {row.margin && row.margin !== "" ? `${row.margin}%` : "-"}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="px-2 py-1 text-sm text-muted-foreground bg-muted/30 rounded">
                      {row.profit && row.profit !== "" ? `₹${row.profit}` : "-"}
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRow(row.id)}
                      disabled={rows.length <= 1}
                      className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>
          {rows.filter(r => r.product_name.toString().trim()).length} products ready to save
        </div>
        <div>
          Use Tab/Enter to navigate • Formulas start with =
        </div>
      </div>
    </div>
  );
}