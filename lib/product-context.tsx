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
  refresh: () => void;
}

const ProductContext = createContext<ProductContextValue>({ products: [], loading: true, refresh: () => {} });

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      setProducts(await res.json());
    } catch {
      // Silently fail — individual consumers can show their own errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <ProductContext.Provider value={{ products, loading, refresh: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
