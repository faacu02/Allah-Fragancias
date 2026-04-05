import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, Bell, Plus, Trash2, Package, FileText, BarChart3, Settings, ArrowLeft, X, Upload, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  collection: string;
  price: number;
  stock: number;
  status: string;
  images: string[];
}

interface InventoryDashboardProps {
  onBack: () => void;
  key?: string;
}

export default function InventoryDashboard({ onBack }: InventoryDashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '', collection: '', price: '', stock: ''
  });
  
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para Carrusel de Vista Previa
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

  const getToken = () => localStorage.getItem('mirage_token');

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

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && newImageFiles.length === 0 && existingImages.length === 0) {
        toast.error("Por favor selecciona al menos una foto para el perfume.");
        return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('collection', newProduct.collection);
      formData.append('price', newProduct.price);
      formData.append('stock', newProduct.stock);
      formData.append('existingImages', JSON.stringify(existingImages));
      
      newImageFiles.forEach(file => {
          formData.append('newImages', file);
      });

      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      
      const saved = await res.json();
      if (editingId) {
          setProducts(products.map(p => p.id === editingId ? saved : p));
      } else {
          setProducts([saved, ...products]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creando/editando producto:", error);
      toast.error("Hubo un error guardando el producto.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.collection.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark flex flex-col md:flex-row text-gray-200">
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-80 bg-darker flex-col p-8 border-r border-gold/15 z-40">
        <div className="mb-12">
          <h1 className="text-gold font-serif text-2xl tracking-[0.2em] uppercase">Mirage</h1>
          <p className="text-[10px] tracking-[0.4em] text-gold/50 mt-1 uppercase">Management Suite</p>
        </div>
        <nav className="flex flex-col gap-6">
          <a className="flex items-center gap-4 text-gold font-bold tracking-[0.1em] border-l-2 border-gold pl-4 transition-all duration-300" href="#">
            <Package size={20} />
            <span className="text-xs tracking-widest uppercase">Inventory</span>
          </a>
          <a className="flex items-center gap-4 text-gold/50 pl-4 hover:text-gold hover:tracking-[0.15em] transition-all duration-300" href="#">
            <FileText size={20} />
            <span className="text-xs tracking-widest uppercase">Orders</span>
          </a>
          <a className="flex items-center gap-4 text-gold/50 pl-4 hover:text-gold hover:tracking-[0.15em] transition-all duration-300" href="#">
            <BarChart3 size={20} />
            <span className="text-xs tracking-widest uppercase">Analytics</span>
          </a>
          <a className="flex items-center gap-4 text-gold/50 pl-4 hover:text-gold hover:tracking-[0.15em] transition-all duration-300" href="#">
            <Settings size={20} />
            <span className="text-xs tracking-widest uppercase">Settings</span>
          </a>
        </nav>
      </aside>

      <main className="md:ml-80 flex-grow pb-24 md:pb-12 text-gray-300">
        <header className="sticky top-0 z-50 bg-dark/60 backdrop-blur-3xl px-6 md:px-12 py-6 flex justify-between items-center w-full border-b border-gold/5">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gold hover:text-gold-light transition-colors cursor-pointer">
              <ArrowLeft size={24} />
            </button>
            <h2 className="font-serif text-gold uppercase tracking-tighter text-xl">Gestión de Inventario</h2>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total Perfumes</span>
              <span className="font-serif text-gold text-lg leading-none">{products.length}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-red-500 uppercase tracking-widest">Bajo Stock</span>
              <span className="font-serif text-red-500 text-lg leading-none">{products.filter(p => p.status === 'LOW').length}</span>
            </div>
          </div>
        </header>

        <section className="px-6 md:px-12 py-8 bg-white/5">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
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
      </main>

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
          <div className="bg-darker border border-gold/30 p-8 w-full max-w-xl shadow-2xl shadow-gold/10 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gold/50 hover:text-gold transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-gold font-serif text-2xl mb-6 uppercase tracking-widest">
                {editingId ? 'Editar Perfume' : 'Nuevo Perfume'}
            </h2>
            <form onSubmit={handleSaveModal} className="space-y-6">
              <div>
                <label className="text-[10px] text-gold/70 uppercase tracking-widest mb-2 block">Nombre de la fragancia</label>
                <input 
                  required 
                  className="w-full bg-dark border-0 border-b border-gold/20 p-3 text-sm text-gray-200 outline-none focus:border-gold transition-colors" 
                  value={newProduct.name} 
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-[10px] text-gold/70 uppercase tracking-widest mb-2 block">Colección</label>
                <input 
                  required 
                  className="w-full bg-dark border-0 border-b border-gold/20 p-3 text-sm text-gray-200 outline-none focus:border-gold transition-colors" 
                  value={newProduct.collection} 
                  onChange={e => setNewProduct({...newProduct, collection: e.target.value})} 
                />
              </div>
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className="text-[10px] text-gold/70 uppercase tracking-widest mb-2 block">Precio ($)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    className="w-full bg-dark border-0 border-b border-gold/20 p-3 text-sm text-gray-200 outline-none focus:border-gold transition-colors" 
                    value={newProduct.price} 
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gold/70 uppercase tracking-widest mb-2 block">Stock Inicial</label>
                  <input 
                    required 
                    type="number" 
                    className="w-full bg-dark border-0 border-b border-gold/20 p-3 text-sm text-gray-200 outline-none focus:border-gold transition-colors" 
                    value={newProduct.stock} 
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gold/10">
                <label className="text-[10px] text-gold/70 uppercase tracking-widest mb-4 block">Fotos del Perfume</label>
                
                <div className="flex flex-wrap gap-4 mb-4">
                    {existingImages.map((imgUrl, i) => (
                        <div key={`existing-${i}`} className="relative w-20 h-20 bg-dark border border-gold/20">
                             <img src={imgUrl} className="w-full h-full object-cover opacity-80" />
                             <button type="button" onClick={() => setExistingImages(existingImages.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-[10px]">
                                 x
                             </button>
                        </div>
                    ))}
                    {newImageFiles.map((file, i) => (
                        <div key={`new-${i}`} className="relative w-20 h-20 bg-dark border border-gold overflow-hidden">
                             <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                             <button type="button" onClick={() => setNewImageFiles(newImageFiles.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-[10px]">
                                 x
                             </button>
                        </div>
                    ))}
                </div>

                <div className="relative w-full">
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={e => {
                        if (e.target.files) {
                            setNewImageFiles([...newImageFiles, ...Array.from(e.target.files)]);
                        }
                    }} 
                  />
                  <div className="w-full bg-dark border-2 border-dashed border-gold/20 hover:border-gold p-4 flex flex-col items-center justify-center text-center transition-colors">
                      <div className="text-gray-500 flex flex-col items-center">
                        <Upload size={20} className="mb-2" />
                        <span className="text-xs">Añadir más imágenes</span>
                      </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gold/10">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="px-6 py-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 text-[10px] uppercase tracking-widest bg-gold text-dark font-bold hover:bg-gold-light transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? 'Guardando...' : 'Guardar Perfume'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Carrusel Cliente (Vista Previa Real) */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex flex-col pt-12 pb-12 px-4 md:px-12 items-center justify-center animate-in fade-in duration-300">
           <button onClick={() => setPreviewProduct(null)} className="absolute top-6 right-6 md:top-12 md:right-12 text-gold/50 hover:text-gold transition-colors z-[210]">
               <X size={32} />
           </button>
           
           <div className="flex flex-col md:flex-row gap-8 md:gap-16 w-full max-w-6xl items-center h-full max-h-[85vh]">
             {/* Slider */}
             <div className="relative w-full md:w-1/2 h-[50vh] md:h-full bg-darker border border-gold/20 flex items-center justify-center overflow-hidden group">
                {previewProduct.images && previewProduct.images.length > 0 ? (
                    <>
                      <img 
                          key={currentImageIndex} 
                          src={previewProduct.images[currentImageIndex]} 
                          className="w-full h-full object-cover transition-opacity duration-500 animate-in fade-in" 
                      />
                      
                      {previewProduct.images.length > 1 && (
                         <>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => prev === 0 ? previewProduct.images.length - 1 : prev - 1); }} 
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 text-gold rounded-full flex items-center justify-center hover:bg-gold hover:text-black transition-colors md:opacity-0 group-hover:opacity-100"
                            >
                              <ChevronLeft size={24} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => prev === previewProduct.images.length - 1 ? 0 : prev + 1); }} 
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 text-gold rounded-full flex items-center justify-center hover:bg-gold hover:text-black transition-colors md:opacity-0 group-hover:opacity-100"
                            >
                              <ChevronRight size={24} />
                            </button>
                            
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                               {previewProduct.images.map((_, i) => (
                                   <button 
                                      key={i} 
                                      onClick={() => setCurrentImageIndex(i)} 
                                      className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-gold w-6' : 'bg-white/40 hover:bg-white/80'}`} 
                                   />
                               ))}
                            </div>
                         </>
                      )}
                    </>
                ) : (
                    <div className="text-gold/50 flex flex-col items-center gap-2">
                        <Package size={32} opacity={0.5} />
                        <span className="text-xs tracking-widest uppercase">Sin imágenes</span>
                    </div>
                )}
             </div>

             {/* Client View Info */}
             <div className="flex-1 w-full text-center md:text-left flex flex-col justify-center">
                <p className="text-gold uppercase tracking-[0.4em] text-xs mb-4">{previewProduct.collection}</p>
                <h1 className="text-5xl md:text-7xl text-white font-serif tracking-tighter mb-6 leading-none">{previewProduct.name}</h1>
                <p className="text-2xl text-gold font-light mb-8">${previewProduct.price.toFixed(2)}</p>
                
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row items-center gap-6 justify-center md:justify-start">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase tracking-widest text-gray-500">Disponibilidad:</span>
                            <span className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border ${previewProduct.status === 'LOW' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-gold/10 text-gold border-gold/30'}`}>
                                {previewProduct.status === 'LOW' ? 'Últimas Unidades' : 'En Stock Inmediato'}
                            </span>
                        </div>
                    </div>
                    
                    <button className="w-full max-w-md border border-gold bg-gold text-dark py-5 uppercase tracking-widest text-xs font-bold hover:bg-transparent hover:text-gold transition-colors">
                        Añadir al Carrito de Compras
                    </button>
                    
                    <p className="text-xs text-gray-500 max-w-md mx-auto md:mx-0 leading-relaxed">
                        Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.
                    </p>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
