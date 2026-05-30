'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  collection: string;
  price: number;
  stock: number;
  status: string;
  images: string[];
}

interface ProductMobileCardsProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onPreview: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductMobileCards({ products, onEdit, onPreview, onDelete }: ProductMobileCardsProps) {
  return (
    <div className="md:hidden grid grid-cols-1 gap-4">
      {products.map((product) => (
        <div key={product.id} className="bg-darker border border-gold/15 p-4 flex gap-4 items-start">
          <div className="w-16 h-20 bg-dark overflow-hidden flex-none cursor-pointer relative" onClick={() => onPreview(product)}>
            <Image
              src={product.images?.[0] || "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400"}
              alt="" fill className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-gold font-serif text-sm truncate">{product.name}</h4>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest truncate">{product.collection}</p>
            <div className="flex items-center gap-3 mt-3 text-xs">
              <span className="text-white font-mono">${product.price.toFixed(2)}</span>
              <span className={`font-bold ${product.stock < 5 ? 'text-red-500' : 'text-white'}`}>{product.stock} uds</span>
              <span className={`text-[10px] px-1.5 py-0.5 uppercase font-bold ${product.status === 'LOW' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{product.status}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => onEdit(product)} className="flex-1 border border-gold/20 text-gold text-[10px] uppercase tracking-widest font-bold py-4 hover:bg-gold/10 transition-colors">Editar</button>
              <button onClick={() => onDelete(product)} className="px-3 py-3 border border-red-500/30 text-red-500 text-[10px] uppercase hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
