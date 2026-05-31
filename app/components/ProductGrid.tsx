'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductCard from './ProductCard';
import { useProducts } from '@/lib/product-context';

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

interface ProductGridProps {
  onProductClick: (product: ProductData) => void;
  onAddToCart: (product: ProductData) => void;
}

const DEBOUNCE_MS = 400;

export default function ProductGrid({ onProductClick, onAddToCart }: ProductGridProps) {
  const { products, loading, total, page, limit, search, collectionFilter, collections, setPage, setSearch, setCollectionFilter } = useProducts();
  const [searchInput, setSearchInput] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput), DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput, setSearch]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section id="coleccion" className="py-16 md:py-32 px-8 md:px-24 bg-dark">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-24 gap-8">
        <div>
          <span className="text-gold text-xs font-bold uppercase tracking-[0.4em] mb-4 block">Selected Works</span>
          <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tighter">Colección Obsidian</h2>
        </div>
        <p className="max-w-md text-gray-400 font-light leading-relaxed">
          Una curaduría de los aromas más raros y preciosos del Oriente Medio, embotellados en cristal tallado a mano.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar por nombre o colección..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full bg-darker border border-gold/10 pl-11 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gold/40 transition-colors"
            aria-label="Buscar fragancias"
          />
        </div>
        <select
          value={collectionFilter}
          onChange={e => setCollectionFilter(e.target.value)}
          className="bg-darker border border-gold/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/40 transition-colors min-w-[160px]"
          aria-label="Filtrar por colección"
        >
          <option value="">Todas las colecciones</option>
          {collections.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-live="polite" aria-label="Cargando productos">
          {[1,2,3].map((n) => (
            <div key={n} className="p-6 md:p-8 border border-gold/10 animate-pulse">
              <div className="aspect-[3/4] bg-white/5 mb-8" />
              <div className="h-5 bg-white/10 w-3/4 mb-2" />
              <div className="h-3 bg-white/5 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-gold/10" aria-live="polite">
          <p className="text-gray-400 text-xs uppercase tracking-widest">
            {search || collectionFilter ? 'No se encontraron fragancias con esos filtros.' : 'No hay fragancias disponibles en este momento.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onProductClick(product)}
                onAddToCart={() => onAddToCart(product)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-16" aria-label="Paginación">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="w-10 h-10 flex items-center justify-center border border-gold/20 text-gold hover:bg-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 text-xs font-bold tracking-widest transition-colors ${
                    p === page
                      ? 'bg-gold text-dark'
                      : 'border border-gold/20 text-gold hover:bg-gold/10'
                  }`}
                  aria-label={`Página ${p}`}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="w-10 h-10 flex items-center justify-center border border-gold/20 text-gold hover:bg-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Página siguiente"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
