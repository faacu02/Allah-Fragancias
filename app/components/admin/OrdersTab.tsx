'use client';

import { Eye } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);

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
  }, []);

  const handleApproveOrder = async (orderId: string) => {
     if(!window.confirm('¿Marcar pago recibido? Esta acción enviará el Email dorado de "Aprobado" al usuario y a su propio correo.')) return;
     
     try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
         method: 'PUT',
         headers: { 
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ status: 'approved' })
      });
       if(!res.ok) throw new Error("Error approving");
       toast.success("Orden Aprobada Correctamente. Emails disparados.");
       fetchOrders();
     } catch(e) {
       toast.error("Hubo un error al aprobar");
     }
  };

  return (
    <section className="px-6 md:px-12 py-12">
       <div className="flex justify-between items-end mb-8 border-b border-gold/20 pb-4">
          <h3 className="text-xl text-gold font-serif tracking-[0.2em] uppercase">Ventas Registradas</h3>
          <span className="text-[10px] uppercase tracking-widest text-gray-500">Total: {orders.length}</span>
       </div>

       {loadingOrders ? (
          <div className="text-gold text-center py-12 text-xs uppercase tracking-widest">Cargando Órdenes...</div>
       ) : orders.length === 0 ? (
          <div className="text-gold/50 text-center py-12 text-xs uppercase tracking-widest">Aún no tienes ventas registradas.</div>
       ) : (
          <div className="flex flex-col gap-6">
             {orders.map((order) => (
                <div key={order.id} className="bg-darker border border-gold/15 p-6 group transition-all duration-300 relative overflow-hidden">
                   <div className={`absolute left-0 top-0 w-1 h-full ${order.status === 'approved' ? 'bg-green-500' : 'bg-gold'}`}></div>
                   <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div>
                         <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
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
                            <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 ${order.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gold/10 text-gold border border-gold/20'}`}>
                               {order.status === 'approved' ? 'Pagado' : 'Pendiente'}
                            </span>
                         </div>
                      </div>
                   </div>

                    <div className="mt-6 border-t border-gold/10 pt-4">
                      <h5 className="text-[10px] uppercase tracking-widest text-gold/70 mb-3">Artículos</h5>
                      <ul className="space-y-2">
                         {order.items.map((item: any) => (
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
                          onClick={() => setPreviewReceipt(order.paymentReceipt)}
                          className="flex items-center gap-2 text-gold text-xs hover:text-gold-light transition-colors"
                        >
                          <Eye size={16} />
                          Ver comprobante
                        </button>
                      </div>
                    )}

                    {order.status === 'pending' && (
                      <div className="mt-6 pt-4 border-t border-gold/20 flex justify-end">
                         <button 
                            onClick={() => handleApproveOrder(order.id)}
                            className="bg-gold text-dark px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gold-light transition-colors"
                         >
                            Marcar Pago Recibido
                         </button>
                      </div>
                    )}
                 </div>
              ))}

              {/* Receipt preview modal */}
              {previewReceipt && (
                <div
                  className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4 cursor-pointer"
                  onClick={() => setPreviewReceipt(null)}
                >
                  <img
                    src={previewReceipt}
                    alt="Comprobante"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
           </div>
        )}
    </section>
  );
}
