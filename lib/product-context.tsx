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

interface FetchResult {
  products: ProductData[];
  total: number;
  page: number;
  limit: number;
  collections: string[];
}

interface ProductContextValue {
  products: ProductData[];
  total: number;
  loading: boolean;
  error: boolean;
  page: number;
  limit: number;
  search: string;
  collectionFilter: string;
  collections: string[];
  setPage: (p: number) => void;
  setSearch: (s: string) => void;
  setCollectionFilter: (c: string) => void;
  refresh: () => void;
}

const defaultCtx: ProductContextValue = {
  products: [], total: 0, loading: true, error: false,
  page: 1, limit: 9, search: '', collectionFilter: '',
  collections: [],
  setPage: () => {}, setSearch: () => {}, setCollectionFilter: () => {}, refresh: () => {},
};

const ProductContext = createContext<ProductContextValue>(defaultCtx);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [total, setTotal] = useState(0);
  const [collections, setCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('');

  const fetchProducts = useCallback(async (p: number, s: string, cf: string) => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '9' });
      if (s) params.set('search', s);
      if (cf) params.set('collection', cf);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`/api/products?${params}`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: FetchResult = await res.json();
      setProducts(data.products);
      setTotal(data.total);
      setCollections(data.collections);
    } catch {
      setProducts([]);
      setTotal(0);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(page, search, collectionFilter); }, [page, search, collectionFilter, fetchProducts]);

  useEffect(() => { setPage(1); }, [search, collectionFilter]);

  return (
    <ProductContext.Provider value={{
      products, total, loading, error, page, limit: 9,
      search, collectionFilter, collections,
      setPage, setSearch, setCollectionFilter,
      refresh: () => fetchProducts(page, search, collectionFilter),
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
