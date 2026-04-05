import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Register from './components/Register';
import ProductDetail from './components/ProductDetail';
import InventoryDashboard from './components/InventoryDashboard';
import ClientDashboard from './components/ClientDashboard';
import CartSidebar, { CartItem } from './components/CartSidebar';
import { motion, AnimatePresence } from 'motion/react';

type View = 'landing' | 'detail' | 'dashboard' | 'profile';

export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [view, setView] = useState<View>('landing');
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessingCart, setIsProcessingCart] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('mirage_user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch(e) {}
    }
    const savedCart = localStorage.getItem('mirage_cart');
    if (savedCart) {
      try { setCartItems(JSON.parse(savedCart)); } catch(e) {}
    }

    // Check query params if returned from MP payment
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    if (status === 'approved' || status === 'success') {
       toast.success("¡Pago exitoso! Su pedido ha sido procesado.");
       setCartItems([]);
       localStorage.removeItem('mirage_cart');
       window.history.replaceState({}, document.title, "/");
    } else if (status === 'failure') {
       toast.error("Hubo un fallo cancelando el pago de Mercado Pago.");
       window.history.replaceState({}, document.title, "/");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mirage_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleLogout = () => {
    localStorage.removeItem('mirage_token');
    localStorage.removeItem('mirage_user');
    setUser(null);
    setCartItems([]);
    if (view === 'dashboard') {
      setView('landing');
    }
  };

  const handleNavigation = (destination: View) => {
    if (destination === 'dashboard') {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      if (user.role !== 'admin') {
        toast.error("Acceso denegado. Se requiere cuenta de administrador.");
        return;
      }
    }
    setView(destination);
  };

  const handleAddToCart = (product: any) => {
    if (!user) {
       setShowAuthModal(true);
       return;
    }
    setCartItems(prev => {
       const exists = prev.find(i => i.productId === product.id);
       if (exists) {
         return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
       }
       return [...prev, {
          productId: product.id,
          title: product.name,
          price: product.price,
          quantity: 1,
          image: product.images[0] || ''
       }];
    });
    setIsCartOpen(true);
  };

  const handleCheckout = async (method: 'efectivo' | 'mercadopago') => {
    setIsProcessingCart(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          paymentMethod: method,
          userId: user.id
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      if (method === 'efectivo') {
         setCartItems([]);
         setIsCartOpen(false);
         toast.success("¡Orden Creada! Contacte al administrador para acordar la entrega y el pago.");
      } else if (method === 'mercadopago' && data.init_point) {
         window.location.href = data.init_point;
      }
    } catch (e: any) {
       console.error("Error al procesar compra", e);
       toast.error("Error procesando compra devuelta: " + e.message);
    } finally {
       setIsProcessingCart(false);
    }
  };

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
            <Navbar 
              onRegisterClick={() => setShowAuthModal(true)} 
              user={user} 
              onLogout={handleLogout}
              cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
              onCartClick={() => setIsCartOpen(true)}
              onProfileClick={() => setView('profile')}
            />
            
            <main>
              <Hero />
              
              {/* Le pasamos add to cart */}
              <ProductGrid onProductClick={() => setView('detail')} onAddToCart={handleAddToCart} />

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
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => handleNavigation('dashboard')}
                    className="text-xs uppercase tracking-widest text-gold hover:text-gold-light font-bold transition-colors duration-300"
                  >
                    Inventory Dashboard
                  </button>
                )}
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
          <div key="dashboard">
             <InventoryDashboard onBack={() => setView('landing')} />
          </div>
        )}

        {view === 'profile' && (
          <div key="profile">
            <ClientDashboard onBack={() => setView('landing')} />
          </div>
        )}
      </AnimatePresence>

      <CartSidebar 
         isOpen={isCartOpen}
         onClose={() => setIsCartOpen(false)}
         items={cartItems}
         isProcessing={isProcessingCart}
         onRemoveItem={(id) => setCartItems(p => p.filter(i => i.productId !== id))}
         onUpdateQuantity={(id, qty) => setCartItems(p => p.map(i => i.productId === id ? { ...i, quantity: qty } : i))}
         onCheckout={handleCheckout}
      />

      <AnimatePresence>
        {showAuthModal && (
          <Register 
             onClose={() => setShowAuthModal(false)} 
             onSuccess={(userData) => {
                 setUser(userData);
                 setShowAuthModal(false);
             }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
