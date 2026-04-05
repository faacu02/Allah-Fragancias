import { motion } from 'motion/react';
import { Search, Bell, Plus, Trash2, Package, FileText, BarChart3, Settings, Menu, ArrowLeft } from 'lucide-react';

interface InventoryDashboardProps {
  onBack: () => void;
  key?: string;
}

export default function InventoryDashboard({ onBack }: InventoryDashboardProps) {
  const PRODUCTS = [
    { name: "Oud Al-Malik", collection: "Imperial Collection", price: "285.00", stock: 42, status: "OK", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400" },
    { name: "Sultan Mirage", collection: "Desert Rose Series", price: "310.00", stock: 3, status: "LOW", image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&q=80&w=400" },
    { name: "Rose de Nuit", collection: "Midnight Floral", price: "195.00", stock: 112, status: "OK", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=400" },
    { name: "Silk Road", collection: "Silk Series", price: "240.00", stock: 18, status: "OK", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400" }
  ];

  return (
    <div className="min-h-screen bg-dark flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
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
        <div className="mt-auto pt-8 border-t border-gold/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-gold/20">
              <span className="text-gold text-xs">SA</span>
            </div>
            <div>
              <p className="font-serif text-xs text-gold">Santal Admin</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Director of Operations</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-80 flex-grow pb-24 md:pb-12">
        {/* Header */}
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
              <span className="font-serif text-gold text-lg leading-none">124</span>
            </div>
            <div className="w-px h-8 bg-gold/30"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-red-500 uppercase tracking-widest">Bajo Stock</span>
              <span className="font-serif text-red-500 text-lg leading-none">3</span>
            </div>
          </div>
          <div className="w-10 h-10 bg-white/5 border border-gold/10 flex items-center justify-center">
            <Bell size={18} className="text-gold" />
          </div>
        </header>

        {/* Tool Bar */}
        <section className="px-6 md:px-12 py-8 bg-white/5">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative w-full lg:flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-gold transition-colors" size={18} />
              <input 
                className="w-full bg-darker border-0 border-b border-gold/30 py-4 pl-12 pr-4 text-sm tracking-wide focus:ring-0 focus:border-gold transition-all placeholder:text-gray-600" 
                placeholder="Buscar fragancias por nombre, nota o colección..." 
                type="text"
              />
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
              <select className="w-full lg:w-48 bg-darker border-0 border-b border-gold/30 py-4 px-4 text-[10px] uppercase tracking-widest appearance-none focus:ring-0 focus:border-gold">
                <option>Colección</option>
              </select>
              <select className="w-full lg:w-48 bg-darker border-0 border-b border-gold/30 py-4 px-4 text-[10px] uppercase tracking-widest appearance-none focus:ring-0 focus:border-gold">
                <option>Disponibilidad</option>
              </select>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
            {PRODUCTS.map((product, i) => (
              <div key={i} className="bg-darker border border-gold/15 p-6 group hover:border-gold/40 transition-all duration-500">
                <div className="flex gap-6">
                  <div className="w-32 h-40 bg-dark overflow-hidden relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    />
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
                          <input className="bg-transparent border-0 p-0 text-sm font-bold w-full focus:ring-0" type="text" defaultValue={product.price}/>
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-gold/70 block mb-1">Unidades</label>
                        <div className="flex items-center gap-2 border-b border-gold/20">
                          <input className={`bg-transparent border-0 p-0 text-sm font-bold w-full focus:ring-0 ${product.status === 'LOW' ? 'text-red-500' : ''}`} type="number" defaultValue={product.stock}/>
                          <span className={`text-[8px] px-2 py-0.5 uppercase font-bold ${product.status === 'LOW' ? 'bg-red-500/10 text-red-500' : 'bg-gold/10 text-gold'}`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button className="flex-1 bg-gold text-dark text-[10px] font-bold uppercase tracking-widest py-3 hover:bg-gold-light transition-all">Editar Detalle</button>
                  <button className="px-4 border border-gold/20 text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FAB */}
      <button className="fixed bottom-24 md:bottom-12 right-6 md:right-12 w-16 h-16 bg-gold text-dark flex items-center justify-center shadow-2xl shadow-gold/20 z-50 hover:scale-105 transition-transform active:scale-95 group">
        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* Bottom Nav (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-6 bg-dark/80 backdrop-blur-2xl border-t border-gold/15 z-50">
        <a className="text-gold scale-110 flex flex-col items-center" href="#">
          <Package size={20} />
          <span className="text-[8px] mt-1 uppercase">Inventory</span>
        </a>
        <a className="text-gray-600 flex flex-col items-center" href="#">
          <FileText size={20} />
          <span className="text-[8px] mt-1 uppercase">Orders</span>
        </a>
        <a className="text-gray-600 flex flex-col items-center" href="#">
          <BarChart3 size={20} />
          <span className="text-[8px] mt-1 uppercase">Analytics</span>
        </a>
        <a className="text-gray-600 flex flex-col items-center" href="#">
          <Settings size={20} />
          <span className="text-[8px] mt-1 uppercase">Settings</span>
        </a>
      </nav>
    </div>
  );
}
