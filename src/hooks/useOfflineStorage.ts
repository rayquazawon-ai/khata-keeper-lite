import { useState, useEffect } from 'react';

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

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

const STORAGE_KEYS = {
  PRODUCTS: 'offline_products',
  PENDING_OPS: 'pending_operations',
  LAST_SYNC: 'last_sync'
};

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingOps, setPendingOps] = useState<PendingOperation[]>([]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = () => {
    try {
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const storedPendingOps = localStorage.getItem(STORAGE_KEYS.PENDING_OPS);

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }

      if (storedPendingOps) {
        setPendingOps(JSON.parse(storedPendingOps));
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  };

  const saveToStorage = (products: Product[], pendingOps: PendingOperation[] = []) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.PENDING_OPS, JSON.stringify(pendingOps));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  const addPendingOperation = (operation: Omit<PendingOperation, 'timestamp'>) => {
    const newOp: PendingOperation = {
      ...operation,
      timestamp: Date.now()
    };
    const newPendingOps = [...pendingOps, newOp];
    setPendingOps(newPendingOps);
    saveToStorage(products, newPendingOps);
  };

  const updateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    saveToStorage(newProducts, pendingOps);
  };

  const addProductOptimistic = (product: Product) => {
    const newProducts = [product, ...products];
    updateProducts(newProducts);

    if (!isOnline) {
      addPendingOperation({
        id: product.id,
        type: 'create',
        data: product
      });
    }
  };

  const updateProductOptimistic = (id: string, updates: Partial<Product>) => {
    const newProducts = products.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    updateProducts(newProducts);

    if (!isOnline) {
      addPendingOperation({
        id: id,
        type: 'update',
        data: updates
      });
    }
  };

  const deleteProductOptimistic = (id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    updateProducts(newProducts);

    if (!isOnline) {
      addPendingOperation({
        id: id,
        type: 'delete',
        data: { id }
      });
    }
  };

  const clearPendingOperations = () => {
    setPendingOps([]);
    localStorage.removeItem(STORAGE_KEYS.PENDING_OPS);
  };

  return {
    isOnline,
    products,
    pendingOps,
    updateProducts,
    addProductOptimistic,
    updateProductOptimistic,
    deleteProductOptimistic,
    addPendingOperation,
    clearPendingOperations,
    saveToStorage,
    loadFromStorage
  };
}