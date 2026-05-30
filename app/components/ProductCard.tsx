'use client';

import { memo } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ShoppingBag } from 'lucide-react';

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

interface ProductProps {
  product: ProductData;
  onClick?: () => void;
  onAddToCart?: () => void;
}

function ProductCard({ product, onClick, onAddToCart }: ProductProps) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group relative p-6 md:p-8 border border-gold/10 hover:bg-white/5 transition-colors duration-700 flex flex-col"
    >
      <div className="aspect-[3/4] bg-darker mb-8 overflow-hidden cursor-pointer relative" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}>
        <Image 
          src={product.images?.[0] || "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80"} 
          alt={product.name}
          fill
          className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
        />
      </div>
      <div className="flex justify-between items-start mb-6">
        <div className="cursor-pointer min-w-0" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}>
          <h3 className="font-serif text-xl text-gold mb-2 truncate">{product.name}</h3>
          <p className="text-xs text-gray-400 uppercase tracking-widest truncate max-w-[120px] md:max-w-[200px]">{product.collection}</p>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">{product.stock > 5 ? 'En stock' : `Solo ${product.stock} uds.`}</p>
        </div>
        <span className="text-gold-light font-bold tracking-tighter text-lg whitespace-nowrap ml-4">
          ${product.price?.toFixed(2) ?? '0.00'}
        </span>
      </div>
      
      <div className="mt-auto">
         {product.stock <= 0 ? (
           <div className="w-full py-4 border border-red-500/20 bg-red-500/5 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-red-500">
             Sin Stock
           </div>
         ) : (
           <button 
             onClick={(e) => { e.stopPropagation(); onAddToCart?.(); }}
             className="w-full py-4 border border-gold/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-gold hover:bg-gold hover:text-dark transition-colors duration-300"
           >
               <ShoppingBag size={16} />
               {product.stock <= 5 ? `Últimas ${product.stock}` : 'Añadir al Carrito'}
           </button>
         )}
      </div>
    </motion.div>
  );
}

export default memo(ProductCard);
