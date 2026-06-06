'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, ChevronUp, ChevronDown, Eye, EyeOff, ImageIcon, Loader } from 'lucide-react';
import { csrfFetch } from '@/lib/csrf-client';
import toast from 'react-hot-toast';

interface CarouselImage {
  id: string;
  imageUrl: string;
  title: string;
  order: number;
  isActive: boolean;
}

export default function CarouselTab() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/carousel');
      const data = await res.json();
      if (res.ok) {
        setImages(data);
      } else {
        toast.error(data.error || 'Error cargando imágenes');
      }
    } catch {
      toast.error('Error cargando imágenes del carrusel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
      toast.error('Formato no soportado (use JPEG, PNG, WebP o AVIF)');
      return;
    }

    setUploadingId('new');
    try {
      const formData = new FormData();
      formData.append('action', 'upload');
      formData.append('image', file);
      formData.append('title', '');

      const res = await csrfFetch('/api/admin/carousel', {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImages(prev => [...prev, data]);
        toast.success('Imagen agregada');
      } else {
        toast.error(data.error || 'Error al subir imagen');
      }
    } catch {
      toast.error('Error al subir imagen');
    } finally {
      setUploadingId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await csrfFetch(`/api/admin/carousel/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setImages(prev => prev.filter(img => img.id !== id));
        toast.success('Imagen eliminada');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al eliminar');
      }
    } catch {
      toast.error('Error al eliminar imagen');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const formData = new FormData();
      formData.append('action', 'update');
      formData.append('id', id);
      formData.append('isActive', String(!currentActive));

      const res = await csrfFetch('/api/admin/carousel', {
        method: 'PUT',
        body: formData,
      });

      if (res.ok) {
        setImages(prev => prev.map(img => img.id === id ? { ...img, isActive: !currentActive } : img));
      } else {
        toast.error('Error al actualizar');
      }
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const handleTitleChange = async (id: string, newTitle: string) => {
    try {
      const formData = new FormData();
      formData.append('action', 'update');
      formData.append('id', id);
      formData.append('title', newTitle);

      const res = await csrfFetch('/api/admin/carousel', {
        method: 'PUT',
        body: formData,
      });

      if (res.ok) {
        setImages(prev => prev.map(img => img.id === id ? { ...img, title: newTitle } : img));
      }
    } catch {
      toast.error('Error al guardar título');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    // Get current orders
    const currentOrder = images[index].order;
    const prevOrder = images[index - 1].order;
    
    // Swap orders
    const updates = [
      { id: images[index].id, order: prevOrder },
      { id: images[index - 1].id, order: currentOrder }
    ];
    
    // Optimistically update UI
    const newImages = [...images];
    newImages[index].order = prevOrder;
    newImages[index - 1].order = currentOrder;
    newImages.sort((a, b) => a.order - b.order);
    setImages(newImages);

    // Send to backend
    await csrfFetch('/api/admin/carousel', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', orders: updates }),
    });
  };

  const handleMoveDown = async (index: number) => {
    if (index === images.length - 1) return;
    
    // Get current orders
    const currentOrder = images[index].order;
    const nextOrder = images[index + 1].order;
    
    // Swap orders
    const updates = [
      { id: images[index].id, order: nextOrder },
      { id: images[index + 1].id, order: currentOrder }
    ];
    
    // Optimistically update UI
    const newImages = [...images];
    newImages[index].order = nextOrder;
    newImages[index + 1].order = currentOrder;
    newImages.sort((a, b) => a.order - b.order);
    setImages(newImages);

    // Send to backend
    await csrfFetch('/api/admin/carousel', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', orders: updates }),
    });
  };

  const canAddMore = images.length < 5;

  return (
    <section className="px-6 md:px-12 py-12">
      <div className="flex justify-between items-end mb-8 border-b border-gold/20 pb-4">
        <div>
          <h3 className="text-xl text-gold font-serif tracking-[0.2em] uppercase">Carrusel Principal</h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Máximo 5 imágenes</p>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-gray-400">{images.length}/5 imágenes</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader size={32} className="animate-spin text-gold" />
        </div>
      ) : (
        <div className="space-y-4">
          {images.length === 0 && !canAddMore ? null : images.map((image, index) => (
            <div
              key={image.id}
              className={`bg-darker border border-gold/15 p-6 transition-all duration-300 ${!image.isActive ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative w-full md:w-48 h-32 bg-dark border border-gold/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <Image
                    src={image.imageUrl}
                    alt={image.title || 'Imagen del carrusel'}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={image.title}
                      onChange={(e) => setImages(prev => prev.map(img => img.id === image.id ? { ...img, title: e.target.value } : img))}
                      onBlur={(e) => handleTitleChange(image.id, e.target.value)}
                      placeholder="Nombre del perfume (título)"
                      className="w-full bg-dark border border-gold/20 text-white text-sm px-4 py-3 focus:border-gold focus:outline-none transition-colors placeholder:text-gray-600"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleToggleActive(image.id, image.isActive)}
                      className={`flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-widest border transition-colors ${
                        image.isActive
                          ? 'border-green-500/30 text-green-500 hover:bg-green-500/10'
                          : 'border-gold/20 text-gray-400 hover:bg-gold/10'
                      }`}
                    >
                      {image.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      {image.isActive ? 'Activo' : 'Inactivo'}
                    </button>

                    <div className="flex items-center gap-1 border border-gold/20">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-2 text-gold hover:bg-gold/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover arriba"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <span className="text-[10px] text-gray-400 px-2">Posición {index + 1}</span>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === images.length - 1}
                        className="p-2 text-gold hover:bg-gold/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover abajo"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(image.id)}
                      className="ml-auto flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-widest border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <X size={14} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {canAddMore && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gold/20 hover:border-gold/40 transition-colors cursor-pointer p-12 flex flex-col items-center justify-center gap-4"
            >
              {uploadingId === 'new' ? (
                <Loader size={32} className="animate-spin text-gold" />
              ) : (
                <>
                  <Upload size={32} className="text-gold/50" />
                  <div className="text-center">
                    <p className="text-gold text-sm uppercase tracking-widest">Subir Imagen</p>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">JPEG, PNG, WebP o AVIF · Máx 5MB</p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleUpload}
                className="hidden"
              />
            </div>
          )}

          {!canAddMore && (
            <p className="text-center text-gray-500 text-xs uppercase tracking-widest py-4">
              Has alcanzado el máximo de 5 imágenes
            </p>
          )}
        </div>
      )}
    </section>
  );
}