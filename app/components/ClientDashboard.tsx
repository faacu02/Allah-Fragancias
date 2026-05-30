'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Package, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; images: string[]; collection: string; };
}

interface Order {
  id: string; total: number; status: string; paymentMethod: string; createdAt: string; items: OrderItem[];
}

export default function ClientDashboard({ onBack }: { onBack: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
     const fetchOrders = async () => {
       try {
         const res = await fetch('/api/my-orders');
         if (!res.ok) throw new Error('Failed to fetch');
         const data = await res.json();
         setOrders(data);
       } catch (error) {
         toast.error("Error al cargar historial de órdenes.");
       } finally {
         setLoading(false);
       }
     };
     fetchOrders();
   }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-dark pt-24 px-8 md:px-24 pb-32">
      <button onClick={onBack} className="flex items-center gap-2 text-gold/70 hover:text-gold uppercase tracking-widest text-xs mb-12 transition-colors duration-300">
        <ArrowLeft size={16} /> Volver a la Tienda
      </button>
      <div className="mb-16">
        <h1 className="font-serif text-5xl md:text-6xl text-white tracking-tighter mb-4">Mi Colección</h1>
        <p className="text-gray-400 font-light text-lg">Historial de adquisiciones y piezas encargadas.</p>
      </div>
      {loading ? (
         <div className="flex justify-center items-center h-64 border border-gold/10">
           <span className="text-gold uppercase tracking-[0.3em] animate-pulse">Cargando registros...</span>
         </div>
      ) : orders.length === 0 ? (
         <div className="flex flex-col justify-center items-center h-64 border border-gold/10 bg-white/5">
           <Package size={64} className="text-gold/30 mb-6" />
           <p className="text-gray-400 uppercase tracking-widest text-sm text-center">Aún no tienes perfumes en tu historial.</p>
         </div>
      ) : (
        <div className="space-y-12">
          {orders.map(order => (
            <div key={order.id} className="border border-gold/20 bg-darker overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black/40 p-6 border-b border-gold/10 gap-4">
                <div className="space-y-1">
                  <p className="text-white text-sm">CÓDIGO: <span className="text-gold font-mono">{order.id.slice(-8).toUpperCase()}</span></p>
                  <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-white text-xl font-serif mb-1">${order.total.toFixed(2)}</p>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest">
                    {order.status === 'pending' ? (
                       <span className="text-yellow-500 flex items-center gap-1"><Clock size={12}/> Pendiente</span>
                    ) : order.status === 'approved' ? (
                       <span className="text-emerald-500 flex items-center gap-1"><CheckCircle size={12}/> Confirmado</span>
                    ) : (
                       <span className="text-red-500 flex items-center gap-1">Cancelado</span>
                    )}
                    <span className="text-gray-500">· {order.paymentMethod === 'transferencia' ? 'Transferencia' : 'Efectivo'}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {order.items.map(item => (
                    <div key={item.id} className="flex gap-6 items-center group">
                      <img 
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80'} 
                        alt="Product" 
                        className="w-20 h-24 object-cover border border-gold/10 grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                      <div>
                        <h4 className="text-gold font-serif text-lg mb-1">{item.product?.name || 'Perfume Descontinuado'}</h4>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{item.product?.collection || '-'}</p>
                        <p className="text-white text-sm bg-white/5 inline-block px-3 py-1 border border-white/10">QT. {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
