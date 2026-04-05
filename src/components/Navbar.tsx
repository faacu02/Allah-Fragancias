import { ShoppingBag, Menu } from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-dark/60 backdrop-blur-xl flex justify-between items-center px-8 h-20 border-b border-gold/10">
      <div className="flex items-center gap-4">
        <button className="text-gold cursor-pointer hover:text-gold-light transition-colors duration-300">
          <Menu size={24} />
        </button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-xl md:text-2xl font-bold tracking-[0.2em] text-gold uppercase text-center"
      >
        ALLAH FRAGANCIAS
      </motion.div>

      <div className="flex items-center gap-4">
        <button className="text-gold cursor-pointer hover:text-gold-light transition-colors duration-300 relative">
          <ShoppingBag size={24} />
          <span className="absolute -top-1 -right-1 bg-gold-light text-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            0
          </span>
        </button>
      </div>
    </nav>
  );
}
