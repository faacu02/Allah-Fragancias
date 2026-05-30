'use client';

import { X, Upload } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ProductFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  initialData?: {
    name: string;
    collection: string;
    price: string;
    stock: string;
    description: string;
    images: string[];
  };
  onClose: () => void;
  onSave: (data: { name: string; collection: string; price: string; stock: string; description: string; existingImages: string[]; newImageFiles: File[] }) => void;
  isSaving: boolean;
}

export default function ProductFormModal({ isOpen, editingId, initialData, onClose, onSave, isSaving }: ProductFormModalProps) {
  const [productName, setProductName] = useState('');
  const [collection, setCollection] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!productName.trim()) errs.push('El nombre del perfume es requerido');
    if (!collection.trim()) errs.push('La colección / marca es requerida');
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.push('El precio debe ser un número positivo');
    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) errs.push('El stock debe ser un número válido');
    if (newImageFiles.some(f => f.size > 5 * 1024 * 1024)) errs.push('Cada imagen debe ser menor a 5MB');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ name: productName, collection, price, stock, description, existingImages, newImageFiles });
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setProductName(initialData.name);
        setCollection(initialData.collection);
        setDescription(initialData.description);
        setPrice(initialData.price);
        setStock(initialData.stock);
        setExistingImages(initialData.images);
      } else {
        setProductName('');
        setCollection('');
        setDescription('');
        setPrice('');
        setStock('');
        setExistingImages([]);
      }
      setNewImageFiles([]);
      setIsDragOver(false);
    }
  }, [isOpen, editingId, initialData]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setNewImageFiles(Array.from(e.target.files).slice(0, 5));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) setNewImageFiles(Array.from(e.dataTransfer.files).slice(0, 5));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-start justify-center p-4 overflow-y-auto pt-20 pb-20"
      role="dialog" aria-modal="true" aria-label={editingId ? 'Editar Perfume' : 'Añadir Nueva Fragancia'}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-darker border border-gold/20 w-full max-w-xl p-8 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gold transition-colors p-2.5">
          <X size={24} />
        </button>

        <h2 className="font-serif text-2xl text-gold mb-8">{editingId ? 'Editar Perfume' : 'Añadir Nueva Fragancia'}</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gold/70">Nombre del Perfume</label>
            <input type="text" value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-transparent border-b border-gold/20 py-2 text-white focus:outline-none focus:border-gold transition-colors placeholder-gray-700"
              placeholder="Ej: Ombré Leather" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gold/70">Colección / Marca</label>
            <input type="text" value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="w-full bg-transparent border-b border-gold/20 py-2 text-white focus:outline-none focus:border-gold transition-colors placeholder-gray-700"
              placeholder="Ej: Tom Ford" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gold/70">Descripción</label>
            <textarea value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent border border-gold/20 py-2 px-3 text-white focus:outline-none focus:border-gold transition-colors placeholder-gray-700 min-h-[80px] resize-y text-sm"
              placeholder="Descripción del perfume..." rows={3} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gold/70">Precio ($)</label>
              <input type="number" value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-transparent border-b border-gold/20 py-2 text-white focus:outline-none focus:border-gold transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gold/70">Stock (Unidades)</label>
              <input type="number" value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-transparent border-b border-gold/20 py-2 text-white focus:outline-none focus:border-gold transition-colors" />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <label className="text-[10px] uppercase tracking-widest text-gold/70">Imágenes (Max 5)</label>

            <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
              {existingImages.map((img, idx) => (
                <div key={`ext-${idx}`} className="relative flex-none w-20 h-24 bg-dark/50 border border-white/10 group">
                  <Image src={img} fill className="object-cover opacity-70 group-hover:opacity-40 transition-opacity" alt="" sizes="80px" />
                  <button onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute inset-0 m-auto w-11 h-11 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {newImageFiles.map((file, idx) => (
                <div key={`new-${idx}`} className="relative flex-none w-20 h-24 bg-dark/50 border border-green-500/30 group">
                  <Image src={URL.createObjectURL(file)} fill className="object-cover opacity-70 group-hover:opacity-40 transition-opacity" alt="" sizes="80px" />
                  <button onClick={() => setNewImageFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute inset-0 m-auto w-11 h-11 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
              onClick={() => document.getElementById('product-image-input')?.click()}
            >
              <Upload className="text-gold/50 mb-2" size={24} />
              <span className="text-xs text-gray-400">Arrastrá imágenes o clic para subir</span>
              <input id="product-image-input" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
          </div>

          {errors.length > 0 && (
            <div className="space-y-1" role="alert">
              {errors.map((err, i) => (
                <p key={i} className="text-red-500 text-[10px] uppercase tracking-widest">{err}</p>
              ))}
            </div>
          )}
          <button onClick={handleSubmit} disabled={isSaving}
            className="w-full bg-gold text-dark font-bold text-sm uppercase tracking-widest py-4 mt-8 hover:bg-gold-light transition-colors disabled:opacity-50">
            {isSaving ? 'Guardando...' : (editingId ? 'Actualizar Registro' : 'Añadir al Catálogo')}
          </button>
        </div>
      </div>
    </div>
  );
}
