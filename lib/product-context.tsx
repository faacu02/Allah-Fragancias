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

function readUrlParams() {
  if (typeof window === 'undefined') return { page: 1, search: '', collection: '' };
  const p = new URLSearchParams(window.location.search);
  return {
    page: Math.max(1, parseInt(p.get('page') || '1', 10)),
    search: p.get('search')?.trim() || '',
    collection: p.get('collection')?.trim() || '',
  };
}

function writeUrlParams(page: number, search: string, collection: string) {
  if (typeof window === 'undefined') return;
  const p = new URLSearchParams();
  if (page > 1) p.set('page', String(page));
  if (search) p.set('search', search);
  if (collection) p.set('collection', collection);
  const qs = p.toString();
  const url = qs ? `/?${qs}` : '/';
  window.history.replaceState(null, '', url);
}

export function ProductProvider({ children }: { children: ReactNode }) {
  const initial = readUrlParams();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [total, setTotal] = useState(0);
  const [collections, setCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPageState] = useState(initial.page);
  const [search, setSearchState] = useState(initial.search);
  const [collectionFilter, setCollectionFilterState] = useState(initial.collection);

  const setPage = useCallback((p: number) => {
    setPageState(p);
    writeUrlParams(p, search, collectionFilter);
  }, [search, collectionFilter]);

  const setSearch = useCallback((s: string) => {
    setSearchState(s);
    setPageState(1);
    writeUrlParams(1, s, collectionFilter);
  }, [collectionFilter]);

  const setCollectionFilter = useCallback((c: string) => {
    setCollectionFilterState(c);
    setPageState(1);
    writeUrlParams(1, search, c);
  }, [search]);

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
