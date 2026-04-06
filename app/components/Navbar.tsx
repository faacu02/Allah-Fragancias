'use client';

import { ShoppingBag, Menu } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  onRegisterClick: () => void;
  user?: any;
  onLogout?: () => void;
  cartCount?: number;
  onCartClick?: () => void;
  onProfileClick?: () => void;
}

export default function Navbar({ onRegisterClick, user, onLogout, cartCount = 0, onCartClick, onProfileClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-dark/60 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-20 border-b border-gold/10">
      <div className="flex items-center gap-4">
        <button className="text-gold cursor-pointer hover:text-gold-light transition-colors duration-300">
          <Menu size={24} />
        </button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-lg md:text-2xl font-bold tracking-[0.2em] text-gold uppercase text-center absolute left-1/2 -translate-x-1/2"
      >
        ALLAH FRAGANCIAS
      </motion.div>

      <div className="flex items-center gap-4 md:gap-6">
        {user ? (
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onProfileClick}
              className="text-gold/70 hover:text-gold transition-colors text-[10px] uppercase tracking-[0.2em]"
            >
               HOLA, {user.name?.split(' ')[0] || 'MIEMBRO'}
            </button>
            <button 
              onClick={onLogout}
              className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-red-500 transition-colors cursor-pointer border border-transparent hover:border-red-500/30 px-3 py-1"
            >
              SALIR
            </button>
          </div>
        ) : (
          <button 
            onClick={onRegisterClick}
            className="text-gold/70 hover:text-gold transition-colors text-[10px] uppercase tracking-[0.2em]"
          >
             INGRESAR
          </button>
        )}
        
        {(!user || user.role !== 'admin') && (
          <button onClick={onCartClick} className="relative text-white hover:text-gold transition-colors cursor-pointer ml-2">
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        )}
      </div>
    </nav>
  );
}
