'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Register from './components/Register';
import ProductDetail from './components/ProductDetail';
import InventoryDashboard from './components/admin/InventoryDashboard';
import ClientDashboard from './components/ClientDashboard';
import CartSidebar, { CartItem } from './components/CartSidebar';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, FileText, User } from 'lucide-react';

type View = 'landing' | 'detail' | 'dashboard' | 'profile';

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [view, setView] = useState<View>('landing');
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessingCart, setIsProcessingCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<{ orderId: string; paymentMethod: string; bankDetails?: any } | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (e) {
        console.error('Failed to fetch user:', e);
      }
    };

    fetchUser();

    const savedCart = localStorage.getItem('mirage_cart');
    if (savedCart) {
      try { setCartItems(JSON.parse(savedCart)); } catch(e) {}
    }

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('reset-token');
    if (token) {
      setResetToken(token);
      setShowResetPassword(true);
      window.history.replaceState({}, document.title, "/");
    }

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout failed:', e);
    }
    setUser(null);
    setCartItems([]);
    toast.success('Sesión finalizada exitosamente.');
    setView('landing');
    setShowAuthModal(true);
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
    if (user.role === 'admin') {
       toast.error("Las cuentas administrativas no pueden utilizar el carrito de compras.");
       return;
    }
    if (product.stock <= 0) {
       toast.error("Este producto no tiene stock disponible.");
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

   const handleCheckout = async (method: 'efectivo' | 'transferencia') => {
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

       setCheckoutSuccess({ orderId: data.orderId, paymentMethod: method, bankDetails: data.bankDetails });
       setCartItems([]);
     } catch (e: any) {
        console.error("Error al procesar compra", e);
        toast.error("Error procesando compra: " + e.message);
     } finally {
        setIsProcessingCart(false);
     }
   };

   const handleCloseCart = () => {
     setIsCartOpen(false);
     setCheckoutSuccess(null);
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
              onMenuClick={() => setIsMenuOpen(true)}
            />
            
            <main>
              <Hero onExploreClick={() => document.getElementById('coleccion')?.scrollIntoView({ behavior: 'smooth' })} />
              
              <ProductGrid onProductClick={(product) => { setSelectedProduct(product); setView('detail'); }} onAddToCart={handleAddToCart} />



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

        {view === 'detail' && selectedProduct && (
          <ProductDetail product={selectedProduct} onBack={() => setView('landing')} onAddToCart={handleAddToCart} />
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
         onClose={handleCloseCart}
         items={cartItems}
         isProcessing={isProcessingCart}
         checkoutSuccess={checkoutSuccess}
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
                 toast.success(`Bienvenido, ${userData.name?.split(' ')[0] || 'Miembro'}.`);
             }} 
          />
        )}

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200]"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 h-full w-80 bg-darker border-r border-gold/15 p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-gold font-serif text-xl tracking-[0.2em] uppercase">Allah</span>
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-gold transition-colors">
                  <X size={20} />
                </button>
              </div>

              {!user ? (
                <div className="flex flex-col gap-4 mt-8">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">Bienvenido</p>
                  <button
                    onClick={() => { setIsMenuOpen(false); setShowAuthModal(true); }}
                    className="w-full py-3 border border-gold/20 text-gold text-xs font-bold uppercase tracking-widest hover:bg-gold/10 transition-colors"
                  >
                    Ingresar / Registrarse
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 h-full">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gold/10">
                    <div className="w-10 h-10 bg-gold/10 border border-gold/30 flex items-center justify-center">
                      <User size={18} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-serif">{user.name || 'Miembro'}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{user.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
                    </div>
                  </div>

                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 px-3">Navegación</p>

                  {user.role === 'admin' ? (
                    <button
                      onClick={() => { setIsMenuOpen(false); handleNavigation('dashboard'); }}
                      className="flex items-center gap-3 px-3 py-3 text-xs uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors border-l-2 border-gold font-bold"
                    >
                      <Package size={16} />
                      Panel de Inventario
                    </button>
                  ) : (
                    <button
                      onClick={() => { setIsMenuOpen(false); setView('profile'); }}
                      className="flex items-center gap-3 px-3 py-3 text-xs uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors border-l-2 border-gold font-bold"
                    >
                      <FileText size={16} />
                      Mis Órdenes
                    </button>
                  )}

                  <div className="mt-auto pt-6 border-t border-gold/10">
                    <button
                      onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                      className="flex items-center gap-3 px-3 py-3 text-xs uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors w-full"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}

        {showResetPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-darker flex flex-col items-center justify-center px-8"
          >
            <div className="w-full max-w-md">
              <div className="font-serif text-xl font-bold tracking-[0.2em] text-gold uppercase text-center mb-10">
                ALLAH FRAGANCIAS
              </div>
              {resetSuccess ? (
                <div className="text-center">
                  <p className="text-gold text-sm mb-4">Contraseña actualizada exitosamente</p>
                  <p className="text-gray-400 text-xs">Ahora podés iniciar sesión con tu nueva contraseña.</p>
                  <button
                    onClick={() => setShowResetPassword(false)}
                    className="mt-8 text-gold text-xs uppercase tracking-widest hover:underline"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!resetPassword || resetPassword.length < 6) {
                    setResetError('La contraseña debe tener al menos 6 caracteres');
                    return;
                  }
                  setResetError('');
                  setResetLoading(true);
                  try {
                    const res = await fetch('/api/auth/reset-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ token: resetToken, password: resetPassword })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    setResetSuccess(true);
                    toast.success('Contraseña actualizada exitosamente');
                  } catch (err: any) {
                    setResetError(err.message);
                  } finally {
                    setResetLoading(false);
                  }
                }}>
                  <h2 className="font-serif text-4xl text-gold-light leading-tight tracking-tighter mb-4 text-center">
                    Nueva Contraseña
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed tracking-widest uppercase text-center mb-10">
                    Ingresá tu nueva contraseña
                  </p>
                  {resetError && <div className="text-red-500 text-xs text-center border border-red-500/20 py-2 bg-red-500/10 mb-6">{resetError}</div>}
                  <div className="relative group mb-10">
                    <input
                      type="password" id="reset-password" value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      className="block w-full py-3 bg-transparent border-0 border-b border-gold/20 text-white outline-none focus:outline-none focus:ring-0 focus:border-gold transition-all duration-300 peer placeholder-transparent"
                      placeholder="Nueva Contraseña" required
                    />
                    <label htmlFor="reset-password" className="absolute left-0 top-3 text-gray-500 text-sm uppercase tracking-widest pointer-events-none transition-all duration-300 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75">
                      Nueva Contraseña
                    </label>
                  </div>
                  <button disabled={resetLoading} className="w-full bg-gradient-to-r from-gold to-gold-dark text-dark font-bold py-5 tracking-[0.2em] uppercase text-xs hover:opacity-90 active:scale-[0.98] transition-all duration-500 shadow-xl shadow-gold/10">
                    {resetLoading ? 'CARGANDO...' : 'RESTABLECER CONTRASEÑA'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
