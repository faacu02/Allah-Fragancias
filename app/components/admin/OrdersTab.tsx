'use client';

import { Eye, XCircle } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { csrfFetch } from '@/lib/csrf-client';
import toast from 'react-hot-toast';

export default function OrdersTab() {
  interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    productId: string;
    product?: { name: string; collection: string };
  }

  interface Order {
    id: string;
    total: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    userId: string;
    user?: { name: string; email: string; phone?: string };
    items: OrderItem[];
    paymentReceipt?: string;
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ orderId: string; action: 'approve' | 'cancel' } | null>(null);

   const fetchOrders = async () => {
     setLoadingOrders(true);
     try {
       const res = await fetch('/api/admin/orders');
       const data = await res.json();
       if(res.ok) setOrders(data);
     } catch (e) {
       toast.error("Error cargando órdenes");
     } finally {
       setLoadingOrders(false);
     }
   };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveOrder = async (orderId: string) => {
     try {
      const res = await csrfFetch(`/api/admin/orders/${orderId}/status`, {
         method: 'PUT',
         headers: { 
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ status: 'approved' })
      });
       if(!res.ok) throw new Error("Error approving");
       toast.success("Orden Aprobada");
       fetchOrders();
     } catch(e) {
       toast.error("Hubo un error al aprobar");
     }
  };

  const handleCancelOrder = async (orderId: string) => {
     try {
      const res = await csrfFetch(`/api/admin/orders/${orderId}/status`, {
         method: 'PUT',
         headers: { 
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ status: 'cancelled' })
      });
       if(!res.ok) throw new Error("Error cancelling");
       toast.success("Orden Cancelada. Stock restaurado.");
       fetchOrders();
     } catch(e) {
       toast.error("Hubo un error al cancelar");
     }
  };

  return (
    <section className="px-6 md:px-12 py-12">
       <div className="flex justify-between items-end mb-8 border-b border-gold/20 pb-4">
          <h3 className="text-xl text-gold font-serif tracking-[0.2em] uppercase">Ventas Registradas</h3>
          <span className="text-[10px] uppercase tracking-widest text-gray-400">Total: {orders.length}</span>
       </div>

       {loadingOrders ? (
          <div className="text-gold text-center py-12 text-xs uppercase tracking-widest">Cargando Órdenes...</div>
       ) : orders.length === 0 ? (
          <div className="text-gold/50 text-center py-12 text-xs uppercase tracking-widest">Aún no tienes ventas registradas.</div>
       ) : (
          <div className="flex flex-col gap-6">
             {orders.map((order) => (
                <div key={order.id} className="bg-darker border border-gold/15 p-6 group transition-all duration-300 relative overflow-hidden">
                   <div className={`absolute left-0 top-0 w-1 h-full ${order.status === 'approved' ? 'bg-green-500' : order.status === 'cancelled' ? 'bg-red-500' : 'bg-gold'}`}></div>
                   <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div>
                         <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                            Orden #{order.id.slice(-8)} • {new Date(order.createdAt).toLocaleDateString()}
                         </p>
                         <h4 className="text-lg text-white font-serif">{order.user?.name || "Cliente Sin Nombre"}</h4>
                         <p className="text-xs text-gray-400">{order.user?.email}</p>
                         {order.user?.phone && <p className="text-xs text-gold mt-1">📞 {order.user?.phone}</p>}
                      </div>
                      
                      <div className="flex flex-col items-start md:items-end gap-2">
                         <p className="font-serif text-2xl text-gold">${order.total}</p>
                         <div className="flex gap-2">
                            <span className="text-[10px] uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/10 text-white">
                               {order.paymentMethod}
                            </span>
                            <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 ${
                              order.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                              order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                              'bg-gold/10 text-gold border border-gold/20'
                            }`}>
                               {order.status === 'approved' ? 'Pagado' : order.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                            </span>
                         </div>
                      </div>
                   </div>

                    <div className="mt-6 border-t border-gold/10 pt-4">
                      <h5 className="text-[10px] uppercase tracking-widest text-gold/70 mb-3">Artículos</h5>
                      <ul className="space-y-2">
                         {order.items.map((item: OrderItem) => (
                            <li key={item.id} className="text-xs text-gray-300 flex justify-between border-b border-white/5 pb-2">
                               <span>{item.quantity}x {item.product?.name || "Perfume"}</span>
                               <span>${item.price}</span>
                            </li>
                         ))}
                      </ul>
                    </div>

                    {order.paymentReceipt && (
                      <div className="mt-4 border-t border-gold/10 pt-4">
                        <h5 className="text-[10px] uppercase tracking-widest text-gold/70 mb-3">Comprobante de Transferencia</h5>
                        <button
                          onClick={() => setPreviewReceipt(order.paymentReceipt ?? null)}
                          className="flex items-center gap-2 text-gold text-xs hover:text-gold-light transition-colors px-3 py-3"
                        >
                          <Eye size={16} />
                          Ver comprobante
                        </button>
                      </div>
                    )}

                    {order.status === 'pending' && (
                       <div className="mt-6 pt-4 border-t border-gold/20 flex justify-end gap-3">
                          <button
                            onClick={() => setConfirmAction({ orderId: order.id, action: 'cancel' })}
                            className="border border-red-500/30 text-red-500 px-4 py-4 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                              onClick={() => setConfirmAction({ orderId: order.id, action: 'approve' })}
                              className="bg-gold text-dark px-6 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gold-light transition-colors"
                         >
                            Marcar Pago Recibido
                         </button>
                       </div>
                    )}
                 </div>
             ))}

             {/* Confirm Action Modal */}
             {confirmAction && (
               <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Confirmar acción">
                 <div className="bg-darker border border-gold/20 w-full max-w-sm p-8 relative">
                   <h3 className="font-serif text-xl text-gold mb-4">{confirmAction.action === 'approve' ? 'Aprobar Pago' : 'Cancelar Orden'}</h3>
                   <p className="text-gray-400 text-sm mb-6">
                     {confirmAction.action === 'approve'
                       ? '¿Confirmás que el pago fue recibido?'
                       : '¿Cancelar esta orden? Se restaurará el stock.'}
                   </p>
                   <div className="flex gap-4">
                      <button onClick={() => setConfirmAction(null)} className="flex-1 border border-gold/20 text-gold text-xs uppercase tracking-widest font-bold py-4 hover:bg-gold/10 transition-colors">
                        Volver
                      </button>
                      <button
                        onClick={() => {
                          if (confirmAction.action === 'approve') {
                            handleApproveOrder(confirmAction.orderId);
                          } else {
                            handleCancelOrder(confirmAction.orderId);
                          }
                          setConfirmAction(null);
                        }}
                        className={`flex-1 text-xs uppercase tracking-widest font-bold py-4 transition-colors ${
                         confirmAction.action === 'approve'
                           ? 'bg-green-500/10 border border-green-500 text-green-500 hover:bg-green-500/20'
                           : 'bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500/20'
                       }`}
                     >
                       {confirmAction.action === 'approve' ? 'Aprobar' : 'Cancelar Orden'}
                     </button>
                   </div>
                 </div>
               </div>
             )}

             {/* Receipt preview modal */}
             {previewReceipt && (
               <div
                 className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4 cursor-pointer"
                 role="dialog"
                 aria-modal="true"
                 aria-label="Vista previa del comprobante"
                 onClick={() => setPreviewReceipt(null)}
               >
                <Image
                  src={previewReceipt}
                  alt="Comprobante"
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                />
               </div>
             )}
          </div>
       )}
    </section>
  );
}
