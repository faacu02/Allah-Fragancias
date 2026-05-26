'use client';

import { motion } from 'motion/react';
import { ShoppingBag } from 'lucide-react';

interface ProductProps {
  product: any;
  onClick?: () => void;
  onAddToCart?: () => void;
}

export default function ProductCard({ product, onClick, onAddToCart }: ProductProps) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group relative p-8 border border-gold/10 hover:bg-white/5 transition-colors duration-700 flex flex-col"
    >
      <div className="aspect-[3/4] bg-darker mb-8 overflow-hidden cursor-pointer" onClick={onClick}>
        <img 
          src={product.images?.[0] || "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80"} 
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
        />
      </div>
      <div className="flex justify-between items-start mb-6">
        <div className="cursor-pointer" onClick={onClick}>
          <h3 className="font-serif text-xl text-gold mb-2">{product.name}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest truncate max-w-[120px] md:max-w-[200px]">{product.collection}</p>
        </div>
        <span className="text-gold-light font-bold tracking-tighter text-lg whitespace-nowrap ml-4">
          ${product.price.toFixed(2)}
        </span>
      </div>
      
      <div className="mt-auto">
         {product.stock <= 0 ? (
           <div className="w-full py-4 border border-red-500/20 bg-red-500/5 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-red-500">
             Sin Stock
           </div>
         ) : product.stock <= 5 ? (
           <div className="w-full py-4 border border-gold/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-gold/50">
             Últimas {product.stock} uds
           </div>
         ) : (
           <button 
             onClick={(e) => { e.stopPropagation(); onAddToCart?.(); }}
             className="w-full py-4 border border-gold/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-gold hover:bg-gold hover:text-dark transition-colors duration-300"
           >
               <ShoppingBag size={16} />
               Añadir al Carrito
           </button>
         )}
      </div>
    </motion.div>
  );
}
