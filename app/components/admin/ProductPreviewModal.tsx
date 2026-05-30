'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

interface Product {
  id: string;
  name: string;
  collection: string;
  price: number;
  stock: number;
  status: string;
  images: string[];
  description?: string | null;
}

interface ProductPreviewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductPreviewModal({ product, onClose }: ProductPreviewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const prevImage = useCallback(() => {
    if (!product?.images?.length) return;
    setCurrentImageIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
  }, [product]);

  const nextImage = useCallback(() => {
    if (!product?.images?.length) return;
    setCurrentImageIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [product, onClose, prevImage, nextImage]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-4"
      role="dialog" aria-modal="true" aria-label="Vista previa del producto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-gold transition-colors z-[120] p-2.5">
        <X size={32} />
      </button>

      <div className="max-w-6xl w-full flex flex-col md:flex-row h-[80vh] bg-darker border border-gold/10">
        <div className="flex-1 relative bg-black/50 group flex items-center justify-center">
          <Image
            src={product.images?.[currentImageIndex] || "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800"}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {product.images?.length > 1 && (
            <>
              <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={prevImage}
                  className="w-11 h-11 bg-black/80 border border-gold/30 text-gold flex items-center justify-center hover:bg-gold hover:text-black transition-colors">←</button>
                <button onClick={nextImage}
                  className="w-11 h-11 bg-black/80 border border-gold/30 text-gold flex items-center justify-center hover:bg-gold hover:text-black transition-colors">→</button>
              </div>
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                {product.images.map((_, idx) => (
                  <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-gold' : 'bg-white/30'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="w-full md:w-96 bg-darker flex flex-col p-8 border-l border-gold/10">
          <div className="mb-auto">
            <p className="text-gold tracking-[0.3em] text-[10px] uppercase mb-2">{product.collection}</p>
            <h2 className="font-serif text-3xl text-white mb-6 leading-tight">{product.name}</h2>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-gold text-lg">$</span>
              <span className="text-4xl font-serif text-white">{product.price}</span>
            </div>
            {product.description && (
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold/50 mb-2">Descripción</p>
                <p className="text-gray-400 text-xs leading-relaxed">{product.description}</p>
              </div>
            )}
            <div className={`inline-flex items-center gap-2 px-4 py-2 border ${product.status === 'LOW' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span className="text-xs uppercase tracking-widest font-bold">Stock: {product.stock} uds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
