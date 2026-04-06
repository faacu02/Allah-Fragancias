'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, Eye, Trash2, Plus, X, Upload } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  collection: string;
  price: number;
  stock: number;
  status: string;
  images: string[];
}

export default function InventoryTab({ getToken }: { getToken: () => string | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', collection: '', price: '', stock: '' });
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpdate = async (id: string, field: 'price' | 'stock', value: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ [field]: value })
      });
      const updated = await res.json();
      setProducts(products.map(p => p.id === id ? updated : p));
    } catch(error) {
      console.error("Error actualizando producto:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este perfume?')) return;
    try {
      await fetch(`/api/products/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error eliminando producto:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImageFiles(Array.from(e.target.files).slice(0, 5));
    }
  };

  const removeExistingImage = (index: number) => {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('collection', newProduct.collection);
    formData.append('price', newProduct.price);
    formData.append('stock', newProduct.stock);
    
    if (editingId) {
        formData.append('existingImages', JSON.stringify(existingImages));
    }
    
    newImageFiles.forEach((file) => {
        formData.append('newImages', file);
    });

    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });

      if (!res.ok) throw new Error("Error en la petición");
      
      await fetchProducts();
      setIsModalOpen(false);
      toast.success(editingId ? "Perfume actualizado magnifícamente" : "Nuevo perfume forjado");
    } catch (error) {
       console.error(error);
       toast.error("Hubo un error guardando el perfume.");
    } finally {
      setIsSaving(false);
    }
  };

  const openNewModal = () => {
      setEditingId(null);
      setNewProduct({ name: '', collection: '', price: '', stock: '' });
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
          stock: product.stock.toString()
      });
      setExistingImages(product.images || []);
      setNewImageFiles([]);
      setIsModalOpen(true);
  };

  const openPreview = (product: Product) => {
      setPreviewProduct(product);
      setCurrentImageIndex(0);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.collection.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <React.Fragment>
      <section className="px-6 md:px-12 py-8 bg-white/5 border-b border-gold/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full lg:flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-gold transition-colors" size={18} />
          <input 
            className="w-full bg-darker text-gray-200 border-0 border-b border-gold/30 py-4 pl-12 pr-4 text-sm tracking-wide outline-none focus:ring-0 focus:border-gold transition-all" 
            placeholder="Buscar fragancias por nombre o colección..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total Perfumes</span>
              <span className="font-serif text-gold text-lg leading-none">{products.length}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-red-500 uppercase tracking-widest">Bajo Stock</span>
              <span className="font-serif text-red-500 text-lg leading-none">{products.filter(p => p.status === 'LOW').length}</span>
            </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-12">
        {loading ? (
          <div className="text-gold text-center py-12 text-xs uppercase tracking-widest">Cargando inventario...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-gold/50 text-center py-12 text-xs uppercase tracking-widest">No hay perfumes listados. Añade uno nuevo.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-darker border border-gold/15 p-6 group hover:border-gold/40 transition-all duration-500">
                <div className="flex gap-6">
                  <div className="w-32 h-40 bg-dark overflow-hidden relative cursor-pointer group/image" onClick={() => openPreview(product)}>
                    <img 
                      src={product.images?.[0] || "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400"} 
                      alt={product.name}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                      onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400")}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                       <Eye className="text-gold" size={24} />
                    </div>
                    {product.images?.length > 1 && (
                        <div className="absolute top-2 right-2 bg-dark/80 text-gold text-[10px] px-2 py-0.5 border border-gold/30 backdrop-blur-sm">
                            +{product.images.length - 1} fotos
                        </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-gold text-lg tracking-tight">{product.name}</h3>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{product.collection}</p>
                    </div>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-gold/70 block mb-1">Precio Unitario</label>
                        <div className="flex items-center gap-2 border-b border-gold/20">
                          <span className="text-xs text-gray-500">$</span>
                          <input 
                            className="bg-transparent text-gray-200 border-0 p-0 text-sm font-bold w-full outline-none focus:ring-0" 
                            type="number" 
                            step="0.01"
                            defaultValue={product.price}
                            onBlur={(e) => handleUpdate(product.id, 'price', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-gold/70 block mb-1">Unidades</label>
                        <div className="flex items-center gap-2 border-b border-gold/20">
                          <input 
                            className={`bg-transparent text-gray-200 border-0 p-0 text-sm font-bold w-full outline-none focus:ring-0 ${product.status === 'LOW' ? 'text-red-500' : ''}`} 
                            type="number" 
                            defaultValue={product.stock}
                            onBlur={(e) => handleUpdate(product.id, 'stock', e.target.value)}
                          />
                          <span className={`text-[8px] px-2 py-0.5 uppercase font-bold ${product.status === 'LOW' ? 'bg-red-500/10 text-red-500' : 'bg-gold/10 text-gold'}`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => openPreview(product)} className="px-4 border border-gold/20 text-gold hover:bg-gold/10 transition-all flex items-center justify-center">
                      <Eye size={16} />
                  </button>
                  <button onClick={() => openEditModal(product)} className="flex-1 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest py-3 hover:bg-gold/10 transition-all">
                      Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="px-4 border border-gold/20 text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAB Agregar */}
      <button 
        onClick={openNewModal}
        className="fixed bottom-24 md:bottom-12 right-6 md:right-12 w-16 h-16 bg-gold text-dark flex items-center justify-center shadow-2xl shadow-gold/20 z-50 hover:scale-105 transition-transform active:scale-95 group"
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* Modal Agregar / Editar Perfume */}
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
                <input 
                  type="text" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-transparent border-b border-gold/20 py-2 text-white focus:outline-none focus:border-gold transition-colors placeholder-gray-700"
                  placeholder="Ej: Ombré Leather"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gold/70">Colección / Marca</label>
                <input 
                  type="text" 
                  value={newProduct.collection}
                  onChange={(e) => setNewProduct({...newProduct, collection: e.target.value})}
                  className="w-full bg-transparent border-b border-gold/20 py-2 text-white focus:outline-none focus:border-gold transition-colors placeholder-gray-700"
                  placeholder="Ej: Tom Ford"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold/70">Precio ($)</label>
                  <input 
                    type="number" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full bg-transparent border-b border-gold/20 py-2 text-white focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold/70">Stock (Unidades)</label>
                  <input 
                    type="number" 
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full bg-transparent border-b border-gold/20 py-2 text-white focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                 <label className="text-[10px] uppercase tracking-widest text-gold/70">Imágenes (Max 5)</label>
                 
                 <div className="flex gap-2 overflow-x-auto pb-2">
                     {existingImages.map((img, idx) => (
                         <div key={`ext-${idx}`} className="relative flex-none w-20 h-24 bg-dark/50 border border-white/10 group">
                             <img src={img} className="w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-opacity" alt=""/>
                             <button onClick={() => removeExistingImage(idx)} className="absolute inset-0 m-auto w-6 h-6 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <X size={14}/>
                             </button>
                         </div>
                     ))}
                 </div>

                 <label className="border-2 border-dashed border-gold/20 hover:border-gold/50 transition-colors flex flex-col items-center justify-center py-8 cursor-pointer bg-dark/30">
                    <Upload className="text-gold/50 mb-2" size={24} />
                    <span className="text-xs text-gray-400">Clic para subir imágenes locales</span>
                    <input 
                       type="file" 
                       multiple 
                       accept="image/*" 
                       className="hidden" 
                       onChange={handleImageChange}
                    />
                 </label>
                 {newImageFiles.length > 0 && (
                    <p className="text-[10px] text-green-500/80 uppercase tracking-wide">
                        {newImageFiles.length} archivo(s) nuevo(s) seleccionado(s).
                    </p>
                 )}
              </div>

              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-gold text-dark font-bold text-sm uppercase tracking-widest py-4 mt-8 hover:bg-gold-light transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : (editingId ? 'Actualizar Registro' : 'Añadir al Catálogo')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Product */}
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
                          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? previewProduct.images.length - 1 : prev - 1); }}
                                  className="w-12 h-12 bg-black/80 border border-gold/30 text-gold flex items-center justify-center hover:bg-gold hover:text-black transition-colors"
                              >
                                  ←
                              </button>
                              <button 
                                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === previewProduct.images.length - 1 ? 0 : prev + 1); }}
                                  className="w-12 h-12 bg-black/80 border border-gold/30 text-gold flex items-center justify-center hover:bg-gold hover:text-black transition-colors"
                              >
                                  →
                              </button>
                          </div>
                      )}
                      
                      {previewProduct.images?.length > 1 && (
                          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                              {previewProduct.images.map((_, idx) => (
                                  <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-gold' : 'bg-white/30'}`} />
                              ))}
                          </div>
                      )}
                  </div>
                  
                  <div className="w-full md:w-96 bg-darker flex flex-col p-8 border-l border-gold/10">
                      <div className="mb-auto">
                          <p className="text-gold tracking-[0.3em] text-[10px] uppercase mb-2">{previewProduct.collection}</p>
                          <h2 className="font-serif text-3xl text-white mb-6 leading-tight">{previewProduct.name}</h2>
                          
                          <div className="flex items-baseline gap-2 mb-8">
                              <span className="text-gold text-lg">$</span>
                              <span className="text-4xl font-serif text-white">{previewProduct.price}</span>
                          </div>
                          
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
