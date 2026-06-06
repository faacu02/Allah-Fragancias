'use client';

import { Eye, Search, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react';
import { csrfFetch } from '@/lib/csrf-client';
import toast from 'react-hot-toast';

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
  status: 'pending' | 'approved' | 'cancelled';
  paymentMethod: 'efectivo' | 'transferencia';
  createdAt: string;
  userId: string;
  user?: { name: string; email: string; phone?: string };
  items: OrderItem[];
  paymentReceipt?: string;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'cancelled';

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      } else {
        toast.error(data.error || 'Error cargando órdenes');
      }
    } catch (e) {
      toast.error("Error cargando órdenes");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    let interval: ReturnType<typeof setInterval>;
    const start = () => { interval = setInterval(fetchOrders, 60000); };
    const stop = () => { clearInterval(interval); };
    start();
    const onVisibility = () => { if (document.hidden) stop(); else start(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { stop(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  const filteredOrders = React.useMemo(() => {
    let result = orders;
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(order =>
        order.id.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [orders, searchQuery, statusFilter]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved': return { label: 'Pagado', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle };
      case 'cancelled': return { label: 'Cancelado', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle };
      default: return { label: 'Pendiente', color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20', icon: Clock };
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      const res = await csrfFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      if (!res.ok) throw new Error("Error approving");
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (!res.ok) throw new Error("Error cancelling");
      toast.success("Orden Cancelada. Stock restaurado.");
      fetchOrders();
    } catch(e) {
      toast.error("Hubo un error al cancelar");
    }
  };

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <section className="px-6 md:px-12 py-12">
      {/* Header */}
      <div className="mb-8 border-b border-gold/20 pb-4">
        <h3 className="text-xl text-gold font-serif tracking-[0.2em] uppercase mb-4">Ventas Registradas</h3>
        
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {([
            { key: 'all', label: 'Todas', count: statusCounts.all },
            { key: 'pending', label: 'Pendientes', count: statusCounts.pending },
            { key: 'approved', label: 'Pagadas', count: statusCounts.approved },
            { key: 'cancelled', label: 'Canceladas', count: statusCounts.cancelled },
          ] as { key: StatusFilter; label: string; count: number }[]).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                statusFilter === key
                  ? 'bg-gold/20 text-gold border-gold/40'
                  : 'text-gray-400 border-gold/10 hover:border-gold/30 hover:text-gray-300'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código, nombre o email..."
            className="w-full bg-dark border border-gold/20 text-white text-sm pl-10 pr-4 py-3 focus:border-gold focus:outline-none transition-colors placeholder:text-gray-600"
          />
        </div>
      </div>

      {loadingOrders ? (
        <div className="space-y-2">
          {[1,2,3].map(n => (
            <div key={n} className="bg-darker border border-gold/15 p-4 animate-pulse flex items-center gap-4">
              <div className="h-4 bg-white/10 w-20" />
              <div className="h-4 bg-white/10 w-32" />
              <div className="h-4 bg-white/10 w-16 ml-auto" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-gold/10">
          <ShoppingBag size={32} className="text-gold/30 mb-4" />
          <p className="text-gold/50 text-xs uppercase tracking-widest">
            {searchQuery ? `No se encontraron órdenes para "${searchQuery}"` : 'No hay órdenes en esta categoría'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[120px_1fr_100px_100px_140px_50px] gap-4 px-4 py-2 text-[10px] uppercase tracking-widest text-gray-500 border-b border-gold/10">
            <span>Código</span>
            <span>Cliente</span>
            <span className="text-right">Total</span>
            <span className="text-center">Estado</span>
            <span className="text-right">Fecha</span>
            <span></span>
          </div>

          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedOrderId === order.id;

            return (
              <div key={order.id} className="bg-darker border border-gold/15 overflow-hidden">
                {/* Main Row */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="grid grid-cols-[100px_1fr_80px] md:grid-cols-[120px_1fr_100px_100px_140px_50px] gap-2 md:gap-4 px-4 py-3 items-center cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span className="text-gold font-serif text-lg tracking-wider">
                    #{order.id.slice(-6)}
                  </span>
                  
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{order.user?.name || "Sin nombre"}</p>
                    <p className="text-gray-500 text-[10px] truncate hidden md:block">{order.user?.email}</p>
                  </div>
                  
                  <span className="text-gold font-serif text-lg text-right">
                    ${order.total.toFixed(2)}
                  </span>
                  
                  <div className="hidden md:flex justify-center">
                    <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-2 py-1 ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                      <StatusIcon size={12} />
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <span className="hidden md:block text-right text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                    <span className="text-gray-600 text-[10px] block">
                      {new Date(order.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                  
                  <div className="flex justify-end">
                    {isExpanded ? <ChevronUp size={16} className="text-gold" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gold/10 px-4 py-4 space-y-4">
                    {/* Mobile Status (hidden on desktop) */}
                    <div className="md:hidden flex items-center gap-2 mb-3">
                      <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-2 py-1 ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleString('es-AR')}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Email</p>
                        <p className="text-gray-300">{order.user?.email || '-'}</p>
                      </div>
                      {order.user?.phone && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Teléfono</p>
                          <p className="text-gold">{order.user.phone}</p>
                        </div>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500">Método de pago:</span>
                      <span className="text-white px-2 py-1 bg-white/5 border border-white/10 text-xs uppercase">{order.paymentMethod}</span>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gold/70 mb-2">Artículos ({order.items.length})</p>
                      <ul className="space-y-1">
                        {order.items.map((item) => (
                          <li key={item.id} className="text-sm text-gray-300 flex justify-between border-b border-white/5 pb-1">
                            <span>{item.quantity}x {item.product?.name || "Producto"}</span>
                            <span className="text-gold">${item.price.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Payment Receipt */}
                    {order.paymentReceipt && (
                      <div className="pt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setPreviewReceipt(order.paymentReceipt ?? null); }}
                          className="flex items-center gap-2 text-gold text-xs hover:text-gold-light transition-colors"
                        >
                          <Eye size={14} />
                          Ver comprobante de transferencia
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    {order.status === 'pending' && (
                      <div className="flex justify-end gap-3 pt-3 border-t border-gold/20">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }}
                          className="border border-red-500/30 text-red-500 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleApproveOrder(order.id); }}
                          className="bg-gold text-dark px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gold-light transition-colors"
                        >
                          Marcar Pago Recibido
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
    </section>
  );
}
