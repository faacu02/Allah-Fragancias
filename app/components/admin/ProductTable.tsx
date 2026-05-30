'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  collection: string;
  price: number;
  stock: number;
  status: string;
  images: string[];
}

type SortKey = 'name' | 'collection' | 'price' | 'stock';

interface ProductTableProps {
  products: Product[];
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
  onSort: (key: SortKey) => void;
  onEdit: (product: Product) => void;
  onPreview: (product: Product) => void;
  onDelete: (product: Product) => void;
  onUpdate: (id: string, field: string, value: string) => void;
}

function SortIcon({ sortKey, sortDir, k }: { sortKey: SortKey; sortDir: 'asc' | 'desc'; k: SortKey }) {
  if (sortKey !== k) return null;
  return sortDir === 'asc'
    ? <ChevronUp size={12} className="inline ml-1" />
    : <ChevronDown size={12} className="inline ml-1" />;
}

function Cell({ product, field, children, onUpdate }: {
  product: Product;
  field: string;
  children: React.ReactNode;
  onUpdate: (id: string, field: string, value: string) => void;
}) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const isEditing = editingCell?.id === product.id && editingCell?.field === field;

  return (
    <div onClick={() => setEditingCell({ id: product.id, field })} className="min-h-[28px] cursor-pointer">
      {isEditing ? (
        <input
          autoFocus
          type={field === 'price' || field === 'stock' ? 'number' : 'text'}
          step={field === 'price' ? '0.01' : '1'}
          defaultValue={
            field === 'name' ? product.name
            : field === 'collection' ? product.collection
            : field === 'price' ? product.price
            : product.stock
          }
          className="w-full bg-darker border border-gold/50 text-white px-2 py-0.5 text-sm outline-none"
          onBlur={(e) => {
            setEditingCell(null);
            if (e.target.value !== String(product[field as keyof Product] ?? '')) {
              onUpdate(product.id, field, e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            if (e.key === 'Escape') setEditingCell(null);
          }}
        />
      ) : children}
    </div>
  );
}

export default function ProductTable({ products, sortKey, sortDir, onSort, onEdit, onPreview, onDelete, onUpdate }: ProductTableProps) {
  return (
    <table className="w-full text-left border-collapse min-w-[700px] hidden md:table">
      <thead>
        <tr className="border-b border-gold/20 text-[10px] uppercase tracking-widest text-gray-400">
          <th className="py-3 pr-2 w-12"></th>
          <th className="py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => onSort('name')}>
            Nombre <SortIcon sortKey={sortKey} sortDir={sortDir} k="name" />
          </th>
          <th className="py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => onSort('collection')}>
            Colección <SortIcon sortKey={sortKey} sortDir={sortDir} k="collection" />
          </th>
          <th className="py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => onSort('price')}>
            Precio <SortIcon sortKey={sortKey} sortDir={sortDir} k="price" />
          </th>
          <th className="py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => onSort('stock')}>
            Stock <SortIcon sortKey={sortKey} sortDir={sortDir} k="stock" />
          </th>
          <th className="py-3 px-2">Estado</th>
          <th className="py-3 px-2 w-24">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
            <td className="py-2 pr-2">
              <div className="w-10 h-12 bg-dark overflow-hidden cursor-pointer relative" onClick={() => onPreview(product)}>
                <Image
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400"}
                  alt="" fill className="object-cover"
                  sizes="40px"
                />
              </div>
            </td>
            <td className="py-2 px-2 text-sm text-white font-medium">
              <Cell product={product} field="name" onUpdate={onUpdate}>
                <span className="truncate block max-w-[200px]">{product.name}</span>
              </Cell>
            </td>
            <td className="py-2 px-2 text-xs text-gray-400 uppercase tracking-widest">
              <Cell product={product} field="collection" onUpdate={onUpdate}>
                {product.collection}
              </Cell>
            </td>
            <td className="py-2 px-2 text-sm font-mono">
              <Cell product={product} field="price" onUpdate={onUpdate}>
                <span className="text-gray-400">$</span> {product.price.toFixed(2)}
              </Cell>
            </td>
            <td className="py-2 px-2">
              <Cell product={product} field="stock" onUpdate={onUpdate}>
                <span className={`text-sm font-bold ${product.stock < 5 ? 'text-red-500' : 'text-white'}`}>{product.stock}</span>
              </Cell>
            </td>
            <td className="py-2 px-2">
              <span className={`text-[10px] px-2 py-0.5 uppercase font-bold ${product.status === 'LOW' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                {product.status}
              </span>
            </td>
            <td className="py-2 px-2">
              <div className="flex gap-1 md:opacity-30 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(product)} className="w-11 h-11 flex items-center justify-center border border-gold/20 text-gold hover:bg-gold/10 transition-all" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => onDelete(product)} className="w-11 h-11 flex items-center justify-center border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all" title="Eliminar">
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
