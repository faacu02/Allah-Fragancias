'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Image from 'next/image';
import { csrfFetch } from '@/lib/csrf-client';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useProducts } from '@/lib/product-context';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, FileText, User } from 'lucide-react';
import type { CartItem } from './components/CartSidebar';

const Register = dynamic(() => import('./components/Register'));
const ProductDetail = dynamic(() => import('./components/ProductDetail'));
const InventoryDashboard = dynamic(() => import('./components/admin/InventoryDashboard'));
const ClientDashboard = dynamic(() => import('./components/ClientDashboard'));
const CartSidebar = dynamic(() => import('./components/CartSidebar'));
const ResetPasswordModal = dynamic(() => import('./components/ResetPasswordModal'));
const ConfirmLogoutModal = dynamic(() => import('./components/ConfirmLogoutModal'));

interface UserData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
}

interface ProductData {
  id: string;
  name: string;
  collection: string;
  price: number;
  stock: number;
  status: string;
  images: string[];
  description?: string | null;
}

interface BankDetails {
  bankName: string;
  accountType: string;
  accountNumber: string;
  alias: string;
  cuit: string;
  holderName: string;
}

type View = 'landing' | 'detail' | 'dashboard' | 'profile';

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [view, setView] = useState<View>('landing');
  const [user, setUser] = useState<UserData | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessingCart, setIsProcessingCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<{ orderId: string; paymentMethod: string; bankDetails?: BankDetails } | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { products: allProducts } = useProducts();
  const [resetToken, setResetToken] = useState('');
  const [confirmLogout, setConfirmLogout] = useState(false);
  const mobileMenuRef = useFocusTrap(isMenuOpen);

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
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(parsed);
      } catch {
        localStorage.removeItem('mirage_cart');
      }
    }

    const hash = window.location.hash;
    const hashToken = hash.match(/reset-token=([^&]+)/);
    const token = hashToken ? hashToken[1] : null;
    if (token) {
      setResetToken(decodeURIComponent(token));
      setShowResetPassword(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    if (status === 'approved' || status === 'success') {
       toast.success("¡Pago exitoso! Su pedido ha sido procesado.");
       setCartItems([]);
       localStorage.removeItem('mirage_cart');
       window.history.replaceState({}, document.title, "/");
    } else if (status === 'failure') {
       toast.error("Hubo un error al procesar el pago. Intente de nuevo.");
       window.history.replaceState({}, document.title, "/");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mirage_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (view !== 'landing') {
      window.history.pushState({ view, scrollY: window.scrollY }, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' as ScrollBehavior });
  }, [view]);

  useEffect(() => {
    const handlePop = (e: PopStateEvent) => {
      setView('landing');
      const state = e.state;
      if (state?.scrollY && state.scrollY > 0) {
        requestAnimationFrame(() => window.scrollTo(0, state.scrollY));
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // Reconcile cart with fresh product data
  useEffect(() => {
    if (!allProducts.length) return;
    setCartItems(prev => {
      const productMap = new Map<string, ProductData>(allProducts.map(p => [p.id, p]));
      const reconciled = prev
        .map(item => {
          const product = productMap.get(item.productId);
          if (!product || product.stock <= 0) return null;
          return { ...item, stock: product.stock, price: product.price };
        })
        .filter((x): x is CartItem => x !== null);
      if (reconciled.length !== prev.length) {
        toast('Algunos productos fueron removidos por falta de stock', { icon: '⚠️' });
      }
      return reconciled;
    });
  }, [allProducts]);

  const handleLogout = async () => {
    try {
      await csrfFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout failed:', e);
    }
    setUser(null);
    setCartItems([]);
    localStorage.removeItem('mirage_cart');
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

  const handleAddToCart = (product: ProductData) => {
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
       const currentQty = exists?.quantity || 0;
       if (currentQty >= product.stock) {
         toast.error(`Solo hay ${product.stock} unidades disponibles.`);
         return prev;
       }
       if (exists) {
         return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1, stock: product.stock } : i);
       }
       return [...prev, {
          productId: product.id,
          title: product.name,
          price: product.price,
          quantity: 1,
          image: product.images[0] || '',
          stock: product.stock
       }];
     });
     setIsCartOpen(true);
     toast.success('Añadido al carrito');
   };

   const handleCheckout = async (method: 'efectivo' | 'transferencia') => {
     setIsProcessingCart(true);
     try {
        const res = await csrfFetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems,
            paymentMethod: method
          })
        });
       const data = await res.json();
       
       if (!res.ok) throw new Error(data.error);

       setCheckoutSuccess({ orderId: data.orderId, paymentMethod: method, bankDetails: data.bankDetails });
       setCartItems([]);
       localStorage.removeItem('mirage_cart');
      } catch (e: unknown) {
         console.error("Error al procesar compra", e);
         toast.error("Error procesando compra: " + (e instanceof Error ? e.message : 'Error desconocido'));
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
              
              <ProductGrid onProductClick={(product: ProductData) => { setSelectedProduct(product); setView('detail'); }} onAddToCart={handleAddToCart} />



              <section className="py-16 md:py-32 px-8 md:px-24 bg-dark">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
                  <div className="relative">
                    <div className="absolute -top-10 -left-10 w-40 h-40 border border-gold/10 -z-10"></div>
                    <Image 
                      alt="Heritage" 
                      className="w-full h-64 md:h-[600px] object-cover grayscale contrast-125"
                      loading="lazy"
                      src="https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=800" 
                      width={800}
                      height={600}
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

            <footer className="w-full py-12 md:py-20 px-8 flex flex-col items-center gap-6 bg-darker border-t border-gold/10">
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
             onSuccess={(userData: UserData) => {
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
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
            <motion.aside
              ref={mobileMenuRef}
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-darker border-r border-gold/15 p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-gold font-serif text-xl tracking-[0.2em] uppercase">Allah</span>
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-gold transition-colors" aria-label="Cerrar menú">
                  <X size={20} />
                </button>
              </div>

              {!user ? (
                <div className="flex flex-col gap-4 mt-8">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">Bienvenido</p>
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
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{user.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
                    </div>
                  </div>

                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 px-3">Navegación</p>

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
                        onClick={() => setConfirmLogout(true)}
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
          <ResetPasswordModal
            token={resetToken}
            onClose={() => setShowResetPassword(false)}
            onLoginRedirect={() => { setShowResetPassword(false); setShowAuthModal(true); }}
          />
        )}

        {confirmLogout && (
          <ConfirmLogoutModal
            onConfirm={() => { setConfirmLogout(false); setIsMenuOpen(false); handleLogout(); }}
            onCancel={() => setConfirmLogout(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
