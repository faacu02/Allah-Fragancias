'use client';

import { useEffect, useRef, useState, memo } from 'react';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useProducts } from '@/lib/product-context';
import { motion, AnimatePresence } from 'motion/react';

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

function getPageRange(current: number, total: number): (number | 'dots')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'dots')[] = [1];
  if (current > 3) pages.push('dots');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('dots');
  pages.push(total);
  return pages;
}

const ProductGrid = memo(function ProductGrid({ onProductClick, onAddToCart }: ProductGridProps) {
  const { products, loading, total, page, limit, search, collectionFilter, collections, setPage, setSearch, setCollectionFilter } = useProducts();
  const [searchInput, setSearchInput] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchInput !== search) setSearch(searchInput);
    }, DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput, setSearch, search]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

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

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar por nombre o colección..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full bg-darker border border-gold/10 pl-11 pr-10 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gold/40 transition-colors"
            aria-label="Buscar fragancias"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); setSearch(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
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

      {!loading && total > 0 && (
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-8">
          Mostrando {startItem}–{endItem} de {total} resultado{total !== 1 ? 's' : ''}
          {search && <> para &ldquo;{search}&rdquo;</>}
          {collectionFilter && <> en {collectionFilter}</>}
        </p>
      )}

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
          {(search || collectionFilter) && (
            <button
              onClick={() => { setSearchInput(''); setSearch(''); setCollectionFilter(''); }}
              className="mt-6 text-gold text-xs uppercase tracking-widest underline hover:text-gold-light transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={page + search + collectionFilter}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onProductClick(product)}
                  onAddToCart={() => onAddToCart(product)}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {totalPages > 1 && (
            <nav className="flex flex-col items-center gap-4 mt-16" aria-label="Paginación">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="w-10 h-10 flex items-center justify-center border border-gold/20 text-gold hover:bg-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                {getPageRange(page, totalPages).map((p, i) =>
                  p === 'dots' ? (
                    <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-600 text-xs">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 text-xs font-bold tracking-widest transition-all duration-200 ${
                        p === page
                          ? 'bg-gold text-dark scale-105'
                          : 'border border-gold/20 text-gold hover:bg-gold/10 hover:scale-105'
                      }`}
                      aria-label={`Página ${p}`}
                      aria-current={p === page ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="w-10 h-10 flex items-center justify-center border border-gold/20 text-gold hover:bg-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </section>
  );
});

export default ProductGrid;
