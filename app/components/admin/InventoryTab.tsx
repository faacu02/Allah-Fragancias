'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Eye, Trash2, Plus, X, Upload, ChevronUp, ChevronDown } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [isSaving, setIsSaving] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', collection: '', price: '', stock: '', description: '' });
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleUpdate = async (id: string, field: string, value: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setProducts(products.map(p => p.id === id ? updated : p));
    } catch {
      console.error("Error actualizando producto");
      toast.error("Error al actualizar producto");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await fetch(`/api/products/${confirmDelete.id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p.id !== confirmDelete.id));
      toast.success("Perfume eliminado");
    } catch {
      toast.error("Error al eliminar producto");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImageFiles(Array.from(e.target.files).slice(0, 5));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      setNewImageFiles(Array.from(e.dataTransfer.files).slice(0, 5));
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('collection', newProduct.collection);
    formData.append('price', newProduct.price);
    formData.append('stock', newProduct.stock);
    formData.append('description', newProduct.description);

    if (editingId) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }

    newImageFiles.forEach((file) => {
      formData.append('newImages', file);
    });

    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error();

      await fetchProducts();
      setIsModalOpen(false);
      toast.success(editingId ? "Perfume actualizado" : "Perfume creado");
    } catch {
      toast.error("Error guardando el perfume.");
    } finally {
      setIsSaving(false);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setNewProduct({ name: '', collection: '', price: '', stock: '', description: '' });
    setExistingImages([]);
    setNewImageFiles([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      collection: product.collection,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description || ''
    });
    setExistingImages(product.images || []);
    setNewImageFiles([]);
    setIsModalOpen(true);
  };

  const openPreview = (product: Product) => {
    setPreviewProduct(product);
    setCurrentImageIndex(0);
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

  let filteredProducts = products.filter(p => {
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

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} className="inline ml-1" /> : <ChevronDown size={12} className="inline ml-1" />;
  };

  const Cell = ({ product, field, children }: { product: Product; field: string; children: React.ReactNode }) => {
    const isEditing = editingCell?.id === product.id && editingCell?.field === field;
    return (
      <div onClick={() => setEditingCell({ id: product.id, field })} className="min-h-[28px] cursor-pointer">
        {isEditing ? (
          <input
            autoFocus
            type={field === 'price' || field === 'stock' ? 'number' : 'text'}
            step={field === 'price' ? '0.01' : '1'}
            defaultValue={field === 'name' ? product.name : field === 'collection' ? product.collection : field === 'price' ? product.price : product.stock}
            className="w-full bg-darker border border-gold/50 text-white px-2 py-0.5 text-sm outline-none"
            onBlur={(e) => {
              setEditingCell(null);
              if (e.target.value !== String(product[field as keyof Product] ?? '')) {
                handleUpdate(product.id, field, e.target.value);
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
  };

  return (
    <React.Fragment>
      {/* Search & Filters */}
      <section className="px-6 md:px-12 py-6 bg-white/5 border-b border-gold/5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-gold transition-colors" size={18} />
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
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total</p>
              <p className="font-serif text-gold text-lg leading-none">{products.length}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-red-500 uppercase tracking-widest">Bajo Stock</p>
              <p className="font-serif text-red-500 text-lg leading-none">{products.filter(p => p.status === 'LOW').length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="px-6 md:px-12 py-8 overflow-x-auto">
        {loading ? (
          <div className="text-gold text-center py-12 text-xs uppercase tracking-widest">Cargando inventario...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-gold/50 text-center py-12 text-xs uppercase tracking-widest">No hay perfumes. Añade uno nuevo.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gold/20 text-[10px] uppercase tracking-widest text-gray-500">
                <th className="py-3 pr-2 w-12"></th>
                <th className="py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => handleSort('name')}>
                  Nombre <SortIcon k="name" />
                </th>
                <th className="py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => handleSort('collection')}>
                  Colección <SortIcon k="collection" />
                </th>
                <th className="py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => handleSort('price')}>
                  Precio <SortIcon k="price" />
                </th>
                <th className="py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => handleSort('stock')}>
                  Stock <SortIcon k="stock" />
                </th>
                <th className="py-3 px-2">Estado</th>
                <th className="py-3 px-2 w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="py-2 pr-2">
                    <div
                      className="w-10 h-12 bg-dark overflow-hidden cursor-pointer"
                      onClick={() => openPreview(product)}
                    >
                      <img
                        src={product.images?.[0] || "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400"}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400")}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-2 text-sm text-white font-medium">
                    <Cell product={product} field="name">
                      <span className="truncate block max-w-[200px]">{product.name}</span>
                    </Cell>
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-400 uppercase tracking-widest">
                    <Cell product={product} field="collection">
                      {product.collection}
                    </Cell>
                  </td>
                  <td className="py-2 px-2 text-sm font-mono">
                    <Cell product={product} field="price">
                      <span className="text-gray-400">$</span> {product.price.toFixed(2)}
                    </Cell>
                  </td>
                  <td className="py-2 px-2">
                    <Cell product={product} field="stock">
                      <span className={`text-sm font-bold ${product.stock < 5 ? 'text-red-500' : 'text-white'}`}>{product.stock}</span>
                    </Cell>
                  </td>
                  <td className="py-2 px-2">
                    <span className={`text-[9px] px-2 py-0.5 uppercase font-bold ${product.status === 'LOW' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex gap-1 opacity-30 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(product)} className="p-1.5 border border-gold/20 text-gold hover:bg-gold/10 transition-all" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => setConfirmDelete({ id: product.id, name: product.name })} className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* FAB */}
      <button
        onClick={openNewModal}
        className="fixed bottom-24 md:bottom-12 right-6 md:right-12 w-14 h-14 bg-gold text-dark flex items-center justify-center shadow-2xl shadow-gold/20 z-50 hover:scale-105 transition-transform active:scale-95 group"
      >
        <Plus size={22} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-darker border border-gold/20 w-full max-w-sm p-8 relative">
            <h3 className="font-serif text-xl text-gold mb-4">Eliminar Perfume</h3>
            <p className="text-gray-400 text-sm mb-6">¿Estás seguro de eliminar <span className="text-white font-medium">{confirmDelete.name}</span>? Esta acción no se puede deshacer.</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gold/20 text-gold text-xs uppercase tracking-widest font-bold py-3 hover:bg-gold/10 transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} className="flex-1 bg-red-500/10 border border-red-500 text-red-500 text-xs uppercase tracking-widest font-bold py-3 hover:bg-red-500/20 transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-start justify-center p-4 overflow-y-auto pt-20 pb-20">
          <div className="bg-darker border border-gold/20 w-full max-w-xl p-8 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-gold transition-colors">
              <X size={24} />
            </button>

            <h2 className="font-serif text-2xl text-gold mb-8">{editingId ? 'Editar Perfume' : 'Añadir Nueva Fragancia'}</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gold/70">Nombre del Perfume</label>
                <input type="text" value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-transparent border-b border-gold/20 py-2 text-white focus:outline-none focus:border-gold transition-colors placeholder-gray-700"
                  placeholder="Ej: Ombré Leather" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gold/70">Colección / Marca</label>
                <input type="text" value={newProduct.collection}
                  onChange={(e) => setNewProduct({...newProduct, collection: e.target.value})}
                  className="w-full bg-transparent border-b border-gold/20 py-2 text-white focus:outline-none focus:border-gold transition-colors placeholder-gray-700"
                  placeholder="Ej: Tom Ford" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gold/70">Descripción</label>
                <textarea value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full bg-transparent border border-gold/20 py-2 px-3 text-white focus:outline-none focus:border-gold transition-colors placeholder-gray-700 min-h-[80px] resize-y text-sm"
                  placeholder="Descripción del perfume..." rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold/70">Precio ($)</label>
                  <input type="number" value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full bg-transparent border-b border-gold/20 py-2 text-white focus:outline-none focus:border-gold transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold/70">Stock (Unidades)</label>
                  <input type="number" value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full bg-transparent border-b border-gold/20 py-2 text-white focus:outline-none focus:border-gold transition-colors" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[10px] uppercase tracking-widest text-gold/70">Imágenes (Max 5)</label>

                <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
                  {existingImages.map((img, idx) => (
                    <div key={`ext-${idx}`} className="relative flex-none w-20 h-24 bg-dark/50 border border-white/10 group">
                      <img src={img} className="w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-opacity" alt="" />
                      <button onClick={() => removeExistingImage(idx)} className="absolute inset-0 m-auto w-6 h-6 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {newImageFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative flex-none w-20 h-24 bg-dark/50 border border-green-500/30 group">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-opacity" alt="" />
                      <button onClick={() => removeNewImage(idx)} className="absolute inset-0 m-auto w-6 h-6 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  className={`border-2 border-dashed transition-colors flex flex-col items-center justify-center py-8 cursor-pointer bg-dark/30 ${isDragOver ? 'border-gold bg-gold/5' : 'border-gold/20 hover:border-gold/50'}`}
                >
                  <Upload className="text-gold/50 mb-2" size={24} />
                  <span className="text-xs text-gray-400">Arrastrá imágenes o clic para subir</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
              </div>

              <button onClick={handleSave} disabled={isSaving}
                className="w-full bg-gold text-dark font-bold text-sm uppercase tracking-widest py-4 mt-8 hover:bg-gold-light transition-colors disabled:opacity-50">
                {isSaving ? 'Guardando...' : (editingId ? 'Actualizar Registro' : 'Añadir al Catálogo')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <button onClick={() => setPreviewProduct(null)} className="absolute top-6 right-6 text-white hover:text-gold transition-colors z-[120]">
            <X size={32} />
          </button>

          <div className="max-w-6xl w-full flex flex-col md:flex-row h-[80vh] bg-darker border border-gold/10">
            <div className="flex-1 relative bg-black/50 group flex items-center justify-center">
              <img
                src={previewProduct.images?.[currentImageIndex] || "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800"}
                alt={previewProduct.name}
                className="max-h-full max-w-full object-contain"
              />
              {previewProduct.images?.length > 1 && (
                <>
                  <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? previewProduct.images.length - 1 : prev - 1)}
                      className="w-12 h-12 bg-black/80 border border-gold/30 text-gold flex items-center justify-center hover:bg-gold hover:text-black transition-colors">←</button>
                    <button onClick={() => setCurrentImageIndex(prev => prev === previewProduct.images.length - 1 ? 0 : prev + 1)}
                      className="w-12 h-12 bg-black/80 border border-gold/30 text-gold flex items-center justify-center hover:bg-gold hover:text-black transition-colors">→</button>
                  </div>
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                    {previewProduct.images.map((_, idx) => (
                      <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-gold' : 'bg-white/30'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="w-full md:w-96 bg-darker flex flex-col p-8 border-l border-gold/10">
              <div className="mb-auto">
                <p className="text-gold tracking-[0.3em] text-[10px] uppercase mb-2">{previewProduct.collection}</p>
                <h2 className="font-serif text-3xl text-white mb-6 leading-tight">{previewProduct.name}</h2>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-gold text-lg">$</span>
                  <span className="text-4xl font-serif text-white">{previewProduct.price}</span>
                </div>
                {previewProduct.description && (
                  <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold/50 mb-2">Descripción</p>
                    <p className="text-gray-400 text-xs leading-relaxed">{previewProduct.description}</p>
                  </div>
                )}
                <div className={`inline-flex items-center gap-2 px-4 py-2 border ${previewProduct.status === 'LOW' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  <span className="text-xs uppercase tracking-widest font-bold">Stock: {previewProduct.stock} uds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}