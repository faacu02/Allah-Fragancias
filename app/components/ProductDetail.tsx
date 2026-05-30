'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductDetailProps {
  product: any;
  onBack: () => void;
  onAddToCart: (product: any) => void;
}

export default function ProductDetail({ product, onBack, onAddToCart }: ProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const images = product.images?.length > 0 ? product.images : ["https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200"];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-dark pt-20 pb-16 md:pb-32"
    >
      <nav className="fixed top-0 w-full z-50 bg-dark/60 backdrop-blur-xl flex justify-between items-center px-8 h-20 border-b border-gold/10">
        <button onClick={onBack} className="text-gold cursor-pointer hover:text-gold-light transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="font-serif text-xl font-bold tracking-[0.2em] text-gold uppercase">ALLAH FRAGANCIAS</div>
        <div className="w-6" />
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-12">
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 mb-16 md:mb-32">
          <div className="w-full md:w-1/2">
            <div className="aspect-[3/4] bg-darker overflow-hidden relative group cursor-zoom-in" onClick={() => setZoomImage(images[currentImageIndex])}>
              <img
                src={images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 border border-gold/30 text-gold flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-gold hover:text-dark"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 border border-gold/30 text-gold flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-gold hover:text-dark"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 flex-none overflow-hidden border-2 transition-colors ${idx === currentImageIndex ? 'border-gold' : 'border-transparent opacity-50 hover:opacity-80'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <nav className="flex gap-2 text-[10px] tracking-widest uppercase text-gray-500 mb-8">
              <span>Colección</span>
              <span>/</span>
              <span className="text-gold">{product.collection}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-gold tracking-tighter mb-4 leading-none">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-4 mb-10">
              <span className="text-4xl font-serif text-white">${product.price?.toFixed(2)}</span>
              <span className={`text-[10px] uppercase tracking-widest px-3 py-1 ${product.status === 'LOW' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                Stock: {product.stock} uds
              </span>
            </div>

            {product.description && (
              <div className="mb-10 max-w-lg">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-gold/50 mb-4">Descripción</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="space-y-8 max-w-md">
              <div className="flex flex-col gap-4">
                {product.stock <= 0 ? (
                  <div className="w-full py-5 border border-red-500/20 bg-red-500/5 text-red-500 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 text-sm">
                    Sin Stock
                  </div>
                ) : (
                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-full py-5 bg-gold text-dark font-bold uppercase tracking-[0.2em] hover:bg-gold-light transition-all duration-500 flex items-center justify-center gap-3"
                  >
                    <ShoppingBag size={18} />
                    Añadir al Carrito
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Zoom modal */}
      {zoomImage && (
        <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4 cursor-pointer" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt={product.name} className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </motion.div>
  );
}