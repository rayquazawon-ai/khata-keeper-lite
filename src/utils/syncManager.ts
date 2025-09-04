import { supabase } from "@/integrations/supabase/client";

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

interface Product {
  id: string;
  productName: string;
  costPrice: number;
  sellingPrice: number;
  lowestSellingPrice: number;
  photos?: string[];
  created_at?: string;
  updated_at?: string;
}

export class SyncManager {
  private static instance: SyncManager;

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  async syncPendingOperations(pendingOps: PendingOperation[]): Promise<boolean> {
    if (!navigator.onLine || pendingOps.length === 0) {
      return false;
    }

    try {
      // Sort by timestamp to maintain order
      const sortedOps = [...pendingOps].sort((a, b) => a.timestamp - b.timestamp);

      for (const operation of sortedOps) {
        await this.executeOperation(operation);
      }

      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }

  private async executeOperation(operation: PendingOperation): Promise<void> {
    switch (operation.type) {
      case 'create':
        await this.createProduct(operation.data);
        break;
      case 'update':
        await this.updateProduct(operation.id, operation.data);
        break;
      case 'delete':
        await this.deleteProduct(operation.id);
        break;
    }
  }

  private async createProduct(productData: Product): Promise<void> {
    const { error } = await supabase
      .from('products')
      .upsert({
        id: productData.id,
        product_name: productData.productName,
        cost_price: productData.costPrice,
        selling_price: productData.sellingPrice,
        lowest_selling_price: productData.lowestSellingPrice,
        photos: productData.photos || []
      });

    if (error) throw error;
  }

  private async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const dbUpdates: any = {};
    
    if (updates.productName) dbUpdates.product_name = updates.productName;
    if (updates.costPrice) dbUpdates.cost_price = updates.costPrice;
    if (updates.sellingPrice) dbUpdates.selling_price = updates.sellingPrice;
    if (updates.lowestSellingPrice) dbUpdates.lowest_selling_price = updates.lowestSellingPrice;
    if (updates.photos) dbUpdates.photos = updates.photos;

    const { error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  }

  private async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async fetchLatestProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(product => ({
      id: product.id,
      productName: product.product_name,
      costPrice: product.cost_price,
      sellingPrice: product.selling_price,
      lowestSellingPrice: product.lowest_selling_price,
      photos: product.photos || [],
      created_at: product.created_at,
      updated_at: product.updated_at
    })) || [];
  }
}