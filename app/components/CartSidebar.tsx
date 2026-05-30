'use client';

import React, { useState, useRef, useEffect } from 'react';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, Banknote, CheckCircle, Copy, Check, Upload, Image as ImageIcon, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { csrfFetch } from '@/lib/csrf-client';

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onCheckout: (method: 'efectivo' | 'transferencia') => void;
  isProcessing: boolean;
  checkoutSuccess: { orderId: string; paymentMethod: string; bankDetails?: { bankName: string; accountType: string; accountNumber: string; alias: string; cuit: string; holderName: string } } | null;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491123456789';

export default function CartSidebar({ isOpen, onClose, items, onRemoveItem, onUpdateQuantity, onCheckout, isProcessing, checkoutSuccess }: CartSidebarProps) {
  const [copied, setCopied] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const focusRef = useFocusTrap(isOpen && !confirmRemoveId);
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleCopyAlias = async () => {
    if (checkoutSuccess?.bankDetails?.alias) {
      await navigator.clipboard.writeText(checkoutSuccess.bankDetails.alias);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !checkoutSuccess) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB');
      return;
    }

    setIsUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      const res = await csrfFetch(`/api/orders/${checkoutSuccess.orderId}/receipt`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Error al subir');
      setReceiptUploaded(true);
      toast.success('Comprobante subido correctamente');
    } catch {
      toast.error('Error al subir el comprobante');
    } finally {
      setIsUploadingReceipt(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const whatsappMessage = checkoutSuccess
    ? encodeURIComponent(
        checkoutSuccess.paymentMethod === 'transferencia'
          ? `Hola! Acabo de realizar una transferencia para la orden #${checkoutSuccess.orderId.slice(-8)}. Te adjunto el comprobante.`
          : `Hola! Quiero coordinar la entrega y el pago en efectivo de mi orden #${checkoutSuccess.orderId.slice(-8)}.`
      )
    : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            aria-label="Cerrar carrito"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-darker border-l border-gold/20 flex flex-col shadow-2xl z-[210]"
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            ref={focusRef}
          >
            <div className="flex items-center justify-between p-6 border-b border-gold/10">
              <h2 className="font-serif text-2xl text-gold uppercase tracking-widest flex items-center gap-3">
                {checkoutSuccess ? <CheckCircle size={24} /> : <ShoppingBag size={24} />}
                {checkoutSuccess ? 'Orden Creada' : 'Mi Canasta'}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gold transition-colors p-2.5">
                <X size={24} />
              </button>
            </div>

            {checkoutSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <p className="text-gold font-serif text-lg mb-2">¡Orden confirmada!</p>
                <p className="text-gray-400 text-xs mb-1 uppercase tracking-widest">
                  #{checkoutSuccess.orderId.slice(-8)}
                </p>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-8">
                  {checkoutSuccess.paymentMethod === 'transferencia'
                    ? 'Envía el comprobante por WhatsApp'
                    : 'Coordina la entrega por WhatsApp'}
                </p>

                {checkoutSuccess.paymentMethod === 'transferencia' && (
                  <div className="w-full mb-8 p-5 bg-dark border border-gold/15 space-y-3 text-left">
                    <p className="text-[10px] uppercase tracking-widest text-gold/50 mb-3">Datos Bancarios</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Banco</span>
                        <span className="text-white font-medium">{checkoutSuccess.bankDetails?.bankName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tipo</span>
                        <span className="text-white font-medium">{checkoutSuccess.bankDetails?.accountType || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Número</span>
                        <span className="text-white font-medium">{checkoutSuccess.bankDetails?.accountNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-gold/10 pt-2 mt-2">
                        <span className="text-gray-400">Alias</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gold font-bold">{checkoutSuccess.bankDetails?.alias || 'N/A'}</span>
                          {checkoutSuccess.bankDetails?.alias && (
                            <button
                              onClick={handleCopyAlias}
                              className="text-gold hover:text-gold-light transition-colors w-11 h-11 flex items-center justify-center"
                              title="Copiar alias"
                            >
                              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">CUIT</span>
                        <span className="text-white font-medium">{checkoutSuccess.bankDetails?.cuit || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Titular</span>
                        <span className="text-white font-medium">{checkoutSuccess.bankDetails?.holderName || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
                  
                  {checkoutSuccess.paymentMethod === 'transferencia' && !receiptUploaded && (
                    <div className="w-full mb-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUploadReceipt}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingReceipt}
                        className="w-full border border-dashed border-gold/30 text-gold flex items-center justify-center gap-3 py-5 text-xs font-bold uppercase tracking-widest hover:bg-gold/5 transition-colors disabled:opacity-50"
                      >
                        {isUploadingReceipt ? (
                          <><Loader size={18} className="animate-spin" /> Subiendo...</>
                        ) : (
                          <><Upload size={18} /> Subir Comprobante de Transferencia</>
                        )}
                      </button>
                      <p className="text-[10px] text-gray-600 text-center mt-2 uppercase tracking-widest">O también puedes enviarlo por WhatsApp</p>
                    </div>
                  )}

                  {receiptUploaded && (
                    <div className="w-full mb-4 p-4 bg-green-500/5 border border-green-500/20 flex items-center gap-3">
                      <CheckCircle size={20} className="text-green-500 flex-none" />
                      <div className="text-left">
                        <p className="text-green-500 text-xs font-bold uppercase tracking-widest">Comprobante subido</p>
                        <p className="text-gray-400 text-[10px]">El administrador lo revisará para confirmar el pago</p>
                      </div>
                    </div>
                  )}

                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500/10 border border-green-500 text-green-400 flex items-center justify-center gap-3 py-5 text-sm font-bold uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all duration-300 mb-4"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {checkoutSuccess.paymentMethod === 'transferencia'
                      ? 'Enviar Comprobante'
                      : 'Coordinar Entrega'}
                  </a>

                  <button
                    onClick={onClose}
                    className="text-gray-400 text-[10px] uppercase tracking-widest hover:text-gold transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
            ) : (
            <>
              {/* Confirm remove overlay */}
              {confirmRemoveId && (
                <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-8"
                  role="alertdialog"
                  aria-modal="true"
                  aria-label="Confirmar eliminación"
                  onKeyDown={(e) => { if (e.key === 'Escape') setConfirmRemoveId(null); }}
                >
                  <div className="bg-darker border border-gold/20 p-6 text-center max-w-xs w-full">
                    <p className="text-gray-300 text-xs uppercase tracking-widest mb-4">¿Eliminar este artículo?</p>
                    <div className="flex gap-3">
                      <button onClick={() => setConfirmRemoveId(null)} className="flex-1 border border-gold/20 text-gold text-[10px] uppercase tracking-widest py-3 hover:bg-gold/10 transition-colors">
                        Cancelar
                      </button>
                      <button onClick={() => { onRemoveItem(confirmRemoveId); setConfirmRemoveId(null); }} className="flex-1 border border-red-500/30 text-red-500 text-[10px] uppercase tracking-widest py-3 hover:bg-red-500/10 transition-colors">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gold/30">
                      <ShoppingBag size={64} className="mb-4" />
                      <p className="uppercase tracking-[0.2em] text-xs">Su canasta está vacía</p>
                    </div>
                  ) : (
                    items.map(item => (
                      <div key={item.productId} className="flex gap-4 bg-dark border border-gold/10 p-3 group">
                        <NextImage src={item.image} alt={item.title} width={64} height={80} className="object-cover w-16 h-20" />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-gold font-serif text-sm truncate">{item.title}</h4>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">${item.price.toFixed(2)} c/u</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gold/20">
                              <button 
                                onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                className="px-4 py-3 text-gold hover:bg-gold/10 transition-colors text-sm"
                              >
                                -
                              </button>
                              <span className="text-sm text-white px-2 font-bold">{item.quantity}</span>
                              <button 
                                onClick={() => {
                                  if (item.quantity < item.stock) {
                                    onUpdateQuantity(item.productId, item.quantity + 1);
                                  } else {
                                    toast.error(`Solo hay ${item.stock} unidades disponibles`);
                                  }
                                }}
                                disabled={item.quantity >= item.stock}
                                className="px-4 py-3 text-gold hover:bg-gold/10 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>
                            <button 
                              onClick={() => setConfirmRemoveId(item.productId)}
                              className="text-red-500/50 hover:text-red-500 transition-colors w-11 h-11 flex items-center justify-center"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 border-t border-gold/10 bg-dark">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-xs uppercase tracking-widest">Total Estimado</span>
                    <span className="font-serif text-3xl text-gold">${total.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-gray-600 text-right uppercase tracking-widest mb-6">Impuestos incluidos · No incluye envío</p>
                  
                   {items.length > 0 && (
                     <div className="space-y-4">
                       <button 
                         disabled={isProcessing}
                         onClick={() => onCheckout('efectivo')}
                         className="w-full bg-gold/10 border border-gold text-gold flex items-center justify-center gap-3 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-dark transition-colors disabled:opacity-50"
                       >
                         <Banknote size={18} />
                         {isProcessing ? 'Procesando...' : 'Pagar en Efectivo (Acordar)'}
                       </button>
                       <button 
                         disabled={isProcessing}
                         onClick={() => onCheckout('transferencia')}
                         className="w-full bg-green-500/10 border border-green-500 text-green-400 flex items-center justify-center gap-3 py-4 text-xs font-bold uppercase tracking-widest hover:bg-green-500/20 hover:text-green-500 transition-colors disabled:opacity-50"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                         </svg>
                         {isProcessing ? 'Procesando...' : 'Pagar por Transferencia'}
                       </button>
                        <p className="text-[10px] text-gray-600 text-center uppercase tracking-widest px-4 leading-relaxed">
                         Al proceder confirma que los precios están listados en moneda local (ARS Peso Argentino).
                       </p>
                     </div>
                   )}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}