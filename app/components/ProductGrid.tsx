'use client';

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

export default function ProductGrid({ onProductClick, onAddToCart }: ProductGridProps) {
  const { products, loading } = useProducts();

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
          <p className="text-gray-400 text-xs uppercase tracking-widest">No hay fragancias disponibles en este momento.</p>
        </div>
      ) : (
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
      )}
    </section>
  );
}
