'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, CreditCard, Banknote } from 'lucide-react';

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onCheckout: (method: 'efectivo' | 'mercadopago') => void;
  isProcessing: boolean;
}

export default function CartSidebar({ isOpen, onClose, items, onRemoveItem, onUpdateQuantity, onCheckout, isProcessing }: CartSidebarProps) {
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-darker border-l border-gold/20 flex flex-col shadow-2xl z-[210]"
          >
            <div className="flex items-center justify-between p-6 border-b border-gold/10">
              <h2 className="font-serif text-2xl text-gold uppercase tracking-widest flex items-center gap-3">
                <ShoppingBag size={24} />
                Mi Canasta
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gold transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gold/30">
                  <ShoppingBag size={64} className="mb-4" />
                  <p className="uppercase tracking-[0.2em] text-xs">Su canasta está vacía</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.productId} className="flex gap-4 bg-dark border border-gold/10 p-3 group">
                    <img src={item.image} alt={item.title} className="w-16 h-20 object-cover" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-gold font-serif text-sm truncate">{item.title}</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">${item.price.toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gold/20">
                          <button 
                            onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            className="px-2 py-1 text-gold hover:bg-gold/10 transition-colors text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs text-white px-2 font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                            className="px-2 py-1 text-gold hover:bg-gold/10 transition-colors text-xs"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => onRemoveItem(item.productId)}
                          className="text-red-500/50 hover:text-red-500 transition-colors p-1"
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
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 text-xs uppercase tracking-widest">Total Estimado</span>
                <span className="font-serif text-3xl text-gold">${total.toFixed(2)}</span>
              </div>
              
              {items.length > 0 && (
                <div className="space-y-4">
                  <button 
                    disabled={isProcessing}
                    onClick={() => onCheckout('mercadopago')}
                    className="w-full bg-[#009EE3] text-white flex items-center justify-center gap-3 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#0089C5] transition-colors disabled:opacity-50"
                  >
                    <CreditCard size={18} />
                    {isProcessing ? 'Procesando...' : 'Pagar con Mercado Pago'}
                  </button>
                  <button 
                    disabled={isProcessing}
                    onClick={() => onCheckout('efectivo')}
                    className="w-full bg-gold/10 border border-gold text-gold flex items-center justify-center gap-3 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-dark transition-colors disabled:opacity-50"
                  >
                    <Banknote size={18} />
                    {isProcessing ? 'Procesando...' : 'Pagar en Efectivo (Acordar)'}
                  </button>
                  <p className="text-[9px] text-gray-600 text-center uppercase tracking-widest px-4 leading-relaxed">
                    Al proceder confirma que los precios están listados en moneda local (ARS Peso Argentino).
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
