'use client';

import React, { useState } from 'react';
import { Package, FileText, ArrowLeft, BarChart3, Settings } from 'lucide-react';

import InventoryTab from './InventoryTab';
import OrdersTab from './OrdersTab';

export default function InventoryDashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');



  return (
    <div className="min-h-screen bg-dark flex flex-col md:flex-row text-gray-200">
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-80 bg-darker flex-col p-8 border-r border-gold/15 z-40">
        <div className="mb-12">
          <h1 className="text-gold font-serif text-2xl tracking-[0.2em] uppercase">Allah</h1>
          <h2 className="text-xl font-serif text-white tracking-[0.2em] mb-12 uppercase pt-2">Administración</h2>
          
          <nav className="flex flex-col gap-4">
            <button 
              onClick={() => setActiveTab('inventory')}
               className={`flex items-center gap-4 px-4 py-3 text-sm tracking-widest uppercase transition-all duration-300 ${activeTab === 'inventory' ? 'bg-gold/10 text-gold border-r-2 border-gold font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Package size={18} /> Inventario
            </button>
            <button 
               onClick={() => setActiveTab('orders')}
               className={`flex items-center gap-4 px-4 py-3 text-sm tracking-widest uppercase transition-all duration-300 ${activeTab === 'orders' ? 'bg-gold/10 text-gold border-r-2 border-gold font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <FileText size={18} /> Órdenes
            </button>

            <a className="flex items-center gap-4 text-gold/50 pl-4 hover:text-gold hover:tracking-[0.15em] transition-all duration-300 mt-8 py-3" href="#">
              <BarChart3 size={20} />
              <span className="text-xs tracking-widest uppercase">Analytics</span>
            </a>
            <a className="flex items-center gap-4 text-gold/50 pl-4 hover:text-gold hover:tracking-[0.15em] transition-all duration-300 py-3" href="#">
              <Settings size={20} />
              <span className="text-xs tracking-widest uppercase">Ajustes</span>
            </a>
          </nav>
        </div>
      </aside>

      <main className="md:ml-80 flex-grow pb-24 md:pb-12 text-gray-300">
        <header className="sticky top-0 z-50 bg-dark/60 backdrop-blur-3xl px-6 md:px-12 py-6 flex justify-between items-center w-full border-b border-gold/5">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gold hover:text-gold-light transition-colors cursor-pointer p-2.5">
              <ArrowLeft size={24} />
            </button>
            <h2 className="font-serif text-gold uppercase tracking-tighter text-lg md:text-xl">
              Panel de Control <span className="text-gold/50 text-[10px] tracking-widest">{activeTab === 'inventory' ? '· Inventario' : '· Órdenes'}</span>
            </h2>
          </div>
        </header>

         {activeTab === 'inventory' ? (
            <InventoryTab />
         ) : (
            <OrdersTab />
         )}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-darker border-t border-gold/15 flex">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 flex flex-col items-center gap-1 py-4 text-[10px] uppercase tracking-widest transition-colors ${activeTab === 'inventory' ? 'text-gold' : 'text-gray-600'}`}
        >
          <Package size={18} />
          Inventario
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 flex flex-col items-center gap-1 py-4 text-[10px] uppercase tracking-widest transition-colors ${activeTab === 'orders' ? 'text-gold' : 'text-gray-600'}`}
        >
          <FileText size={18} />
          Órdenes
        </button>
      </nav>
    </div>
  );
}
