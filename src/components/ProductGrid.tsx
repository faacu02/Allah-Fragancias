import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

interface ProductGridProps {
  onProductClick: (product: any) => void;
  onAddToCart: (product: any) => void;
}

export default function ProductGrid({ onProductClick, onAddToCart }: ProductGridProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
         setProducts(data);
         setLoading(false);
      })
      .catch(err => {
         console.error("Error loading products", err);
         setLoading(false);
      });
  }, []);

  return (
    <section className="py-32 px-8 md:px-24 bg-dark">
      <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
        <div>
          <span className="text-gold text-xs font-bold uppercase tracking-[0.4em] mb-4 block">Selected Works</span>
          <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tighter">Colección Obsidian</h2>
        </div>
        <p className="max-w-md text-gray-400 font-light leading-relaxed">
          Una curaduría de los aromas más raros y preciosos del Oriente Medio, embotellados en cristal tallado a mano.
        </p>
      </div>
      
      {loading ? (
        <div className="text-center text-gold/50 tracking-widest uppercase">Cargando colección...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
