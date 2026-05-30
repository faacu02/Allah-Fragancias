'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface ProductData {
  id: string;
  name: string;
  collection: string;
  price: number;
  stock: number;
  status: string;
  images: string[];
  description?: string | null;
}

interface ProductContextValue {
  products: ProductData[];
  loading: boolean;
  error: boolean;
  refresh: () => void;
}

const ProductContext = createContext<ProductContextValue>({ products: [], loading: true, error: false, refresh: () => {} });

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch('/api/products', { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
        setError(true);
      }
    } catch {
      setProducts([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <ProductContext.Provider value={{ products, loading, error, refresh: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
