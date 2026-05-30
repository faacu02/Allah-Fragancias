'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { csrfFetch } from '@/lib/csrf-client';
import { Search, Plus } from 'lucide-react';
import ProductTable from './ProductTable';
import ProductMobileCards from './ProductMobileCards';
import ProductFormModal from './ProductFormModal';
import ProductPreviewModal from './ProductPreviewModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface Product {
  id: string;
  name: string;
  collection: string;
  price: number;
  stock: number;
  status: string;
  description?: string | null;
  images: string[];
}

type SortKey = 'name' | 'collection' | 'price' | 'stock';
type SortDir = 'asc' | 'desc';

export default function InventoryTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleUpdate = async (id: string, field: string, value: string) => {
    try {
      const res = await csrfFetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      toast.success('Guardado');
    } catch {
      toast.error('Error al actualizar producto');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await csrfFetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      toast.success('Perfume eliminado');
    } catch {
      toast.error('Error al eliminar producto');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSave = async (data: { name: string; collection: string; price: string; stock: string; description: string; existingImages: string[]; newImageFiles: File[] }) => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('collection', data.collection);
    formData.append('price', data.price);
    formData.append('stock', data.stock);
    formData.append('description', data.description);

    if (editingId) {
      formData.append('existingImages', JSON.stringify(data.existingImages));
    }

    data.newImageFiles.forEach((file) => formData.append('newImages', file));

    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await csrfFetch(url, { method, body: formData });
      if (!res.ok) throw new Error();

      await fetchProducts();
      setIsModalOpen(false);
      toast.success(editingId ? 'Perfume actualizado' : 'Perfume creado');
    } catch {
      toast.error('Error guardando el perfume.');
    } finally {
      setIsSaving(false);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const collections = [...new Set(products.map(p => p.collection))].sort();

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.collection.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCollection = !collectionFilter || p.collection === collectionFilter;
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesCollection && matchesStatus;
  });

  filteredProducts.sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortKey === 'collection') cmp = a.collection.localeCompare(b.collection);
    else if (sortKey === 'price') cmp = a.price - b.price;
    else if (sortKey === 'stock') cmp = a.stock - b.stock;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <React.Fragment>
      <section className="px-6 md:px-12 py-6 bg-white/5 border-b border-gold/5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm group-focus-within:text-gold transition-colors" size={18} />
            <input
              className="w-full bg-darker text-gray-200 border-0 border-b border-gold/30 py-3 pl-12 pr-4 text-sm tracking-wide outline-none focus:ring-0 focus:border-gold transition-all"
              placeholder="Buscar por nombre o colección..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            className="bg-darker text-gray-300 border border-gold/20 py-3 px-4 text-xs uppercase tracking-widest outline-none focus:border-gold transition-colors"
          >
            <option value="">Todas las colecciones</option>
            {collections.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-darker text-gray-300 border border-gold/20 py-3 px-4 text-xs uppercase tracking-widest outline-none focus:border-gold transition-colors"
          >
            <option value="">Todos los estados</option>
            <option value="OK">OK</option>
            <option value="LOW">Low Stock</option>
          </select>
          <div className="flex gap-6 items-center">
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Total</p>
              <p className="font-serif text-gold text-lg leading-none">{products.length}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-red-500 uppercase tracking-widest">Bajo Stock</p>
              <p className="font-serif text-red-500 text-lg leading-none">{products.filter(p => p.status === 'LOW').length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-8 overflow-x-auto" aria-live="polite" aria-label="Listado de productos">
        {loading ? (
          <div className="text-gold text-center py-12 text-xs uppercase tracking-widest">Cargando inventario...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-gold/50 text-center py-12 text-xs uppercase tracking-widest">No hay perfumes. Añade uno nuevo.</div>
        ) : (
          <>
            <ProductMobileCards
              products={filteredProducts}
              onEdit={openEditModal}
              onPreview={setPreviewProduct}
              onDelete={(p) => setDeleteTarget({ id: p.id, name: p.name })}
            />
            <ProductTable
              products={filteredProducts}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              onEdit={openEditModal}
              onPreview={setPreviewProduct}
              onDelete={(p) => setDeleteTarget({ id: p.id, name: p.name })}
              onUpdate={handleUpdate}
            />
          </>
        )}
      </section>

      <button
        onClick={openNewModal}
        className="fixed bottom-24 md:bottom-12 right-6 md:right-12 w-14 h-14 bg-gold text-dark flex items-center justify-center shadow-2xl shadow-gold/20 z-50 hover:scale-105 transition-transform active:scale-95 group"
        aria-label="Añadir nuevo perfume"
      >
        <Plus size={22} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      <ProductFormModal
        isOpen={isModalOpen}
        editingId={editingId}
        initialData={editingProduct ? {
          name: editingProduct.name,
          collection: editingProduct.collection,
          price: editingProduct.price.toString(),
          stock: editingProduct.stock.toString(),
          description: editingProduct.description || '',
          images: editingProduct.images || []
        } : undefined}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <ProductPreviewModal
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
      />

      {deleteTarget && (
        <ConfirmDeleteModal
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </React.Fragment>
  );
}
