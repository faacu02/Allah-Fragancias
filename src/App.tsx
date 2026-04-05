import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Register from './components/Register';
import ProductDetail from './components/ProductDetail';
import InventoryDashboard from './components/InventoryDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

type View = 'landing' | 'detail' | 'dashboard';

export default function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [view, setView] = useState<View>('landing');

  return (
    <div className="min-h-screen bg-dark selection:bg-gold/30 selection:text-white">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Navbar onRegisterClick={() => setShowRegister(true)} />
            
            <main>
              <Hero />
              
              <ProductGrid onProductClick={() => setView('detail')} />

              {/* Sommelier IA Section */}
              <section className="relative py-32 px-8 overflow-hidden bg-darker">
                <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="w-24 h-24 mb-10 flex items-center justify-center bg-white/5 border border-gold/20"
                  >
                    <div className="text-gold text-4xl">IA</div>
                  </motion.div>
                  <h2 className="font-serif text-4xl md:text-6xl text-white mb-6 tracking-tighter">Sommelier IA</h2>
                  <p className="max-w-2xl text-gray-400 text-lg md:text-xl font-light mb-12 italic leading-relaxed">
                    "Deje que nuestra IA encuentre su aroma perfecto. Una experiencia sensorial guiada por algoritmos de perfumería ancestral."
                  </p>
                  <button className="bg-gold text-dark px-16 py-5 text-sm font-bold uppercase tracking-[0.3em] hover:bg-gold-light transition-all duration-500 shadow-2xl shadow-gold/10">
                    Consultar Sommelier
                  </button>
                </div>
              </section>

              {/* Heritage Section */}
              <section className="py-32 px-8 md:px-24 bg-dark">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                  <div className="relative">
                    <div className="absolute -top-10 -left-10 w-40 h-40 border border-gold/10 -z-10"></div>
                    <img 
                      alt="Heritage" 
                      className="w-full h-[600px] object-cover grayscale contrast-125"
                      referrerPolicy="no-referrer"
                      src="https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=800" 
                    />
                  </div>
                  <div className="space-y-8">
                    <span className="text-gold text-xs font-bold uppercase tracking-[0.4em]">Nuestra Herencia</span>
                    <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tighter leading-tight">El Legado de la Alquimia Árabe</h2>
                    <div className="h-px w-24 bg-gold"></div>
                    <p className="text-gray-400 leading-loose font-light text-lg">
                      Fundada en el corazón de los oasis antiguos, Allah Fragancias fusiona la sabiduría milenaria de los maestros perfumistas con la sofisticación contemporánea. Cada creación es un tributo a la ruta de las especias, utilizando solo ingredientes de origen ético y pureza inigualable.
                    </p>
                  </div>
                </div>
              </section>
            </main>

            <footer className="w-full py-20 px-8 flex flex-col items-center gap-6 bg-darker border-t border-gold/10">
              <div className="font-serif text-xl text-gold tracking-[0.2em] mb-4 uppercase">ALLAH FRAGANCIAS</div>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
                {['Privacy Policy', 'Terms of Service', 'Shipping', 'Contact'].map((item) => (
                  <a key={item} href="#" className="text-xs uppercase tracking-widest text-gray-600 hover:text-gold transition-colors duration-300">
                    {item}
                  </a>
                ))}
                <button 
                  onClick={() => setView('dashboard')}
                  className="text-xs uppercase tracking-widest text-gold/40 hover:text-gold transition-colors duration-300"
                >
                  Dashboard
                </button>
              </div>
              <div className="text-gray-700 text-[10px] uppercase tracking-[0.3em] text-center">
                © 2024 ALLAH FRAGANCIAS. THE OBSIDIAN MIRAGE.
              </div>
            </footer>
          </motion.div>
        )}

        {view === 'detail' && (
          <ProductDetail key="detail" onBack={() => setView('landing')} />
        )}

        {view === 'dashboard' && (
          <InventoryDashboard key="dashboard" onBack={() => setView('landing')} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRegister && (
          <Register onClose={() => setShowRegister(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
