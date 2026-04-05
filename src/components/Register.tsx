import { motion } from 'motion/react';
import { X, Eye, Apple, Mail } from 'lucide-react';

interface RegisterProps {
  onClose: () => void;
}

export default function Register({ onClose }: RegisterProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-darker flex flex-col overflow-y-auto"
    >
      {/* Top Bar */}
      <nav className="flex justify-between items-center px-8 h-20 border-b border-gold/5">
        <button 
          onClick={onClose}
          className="text-gold hover:text-gold-light transition-colors cursor-pointer"
        >
          <X size={24} />
        </button>
        <div className="font-serif text-xl font-bold tracking-[0.2em] text-gold uppercase">
          ALLAH FRAGANCIAS
        </div>
        <div className="w-6" /> {/* Spacer */}
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-8 py-12 relative">
        {/* Geometric Background Mirage (Subtle Pattern) */}
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none overflow-hidden">
          <div className="w-full h-full" style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)`,
            backgroundSize: '40px 40px' 
          }}></div>
        </div>

        <div className="w-full max-w-md z-10">
          <header className="mb-12 text-center md:text-left">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-serif text-4xl md:text-5xl text-gold-light leading-tight tracking-tighter mb-4"
            >
              Únase al Círculo
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-sm leading-relaxed tracking-widest uppercase max-w-xs mx-auto md:mx-0"
            >
              Acceda a la exclusividad de nuestras fragancias de herencia y ediciones limitadas.
            </motion.p>
          </header>

          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            <div className="relative group">
              <input 
                type="text" 
                id="name"
                className="block w-full py-3 bg-transparent border-0 border-b border-gold/20 text-white focus:ring-0 focus:border-gold transition-all duration-300 peer placeholder-transparent"
                placeholder="Nombre Completo"
              />
              <label 
                htmlFor="name"
                className="absolute left-0 top-3 text-gray-500 text-sm uppercase tracking-widest pointer-events-none transition-all duration-300 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75"
              >
                Nombre Completo
              </label>
            </div>

            <div className="relative group">
              <input 
                type="email" 
                id="email"
                className="block w-full py-3 bg-transparent border-0 border-b border-gold/20 text-white focus:ring-0 focus:border-gold transition-all duration-300 peer placeholder-transparent"
                placeholder="Correo Electrónico"
              />
              <label 
                htmlFor="email"
                className="absolute left-0 top-3 text-gray-500 text-sm uppercase tracking-widest pointer-events-none transition-all duration-300 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75"
              >
                Correo Electrónico
              </label>
            </div>

            <div className="relative group">
              <input 
                type="password" 
                id="password"
                className="block w-full py-3 bg-transparent border-0 border-b border-gold/20 text-white focus:ring-0 focus:border-gold transition-all duration-300 peer placeholder-transparent"
                placeholder="Contraseña"
              />
              <label 
                htmlFor="password"
                className="absolute left-0 top-3 text-gray-500 text-sm uppercase tracking-widest pointer-events-none transition-all duration-300 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75"
              >
                Contraseña
              </label>
              <button type="button" className="absolute right-0 top-3 text-gray-600 hover:text-gold transition-colors">
                <Eye size={18} />
              </button>
            </div>

            <button className="w-full bg-gradient-to-r from-gold to-gold-dark text-dark font-bold py-5 tracking-[0.2em] uppercase text-xs hover:opacity-90 active:scale-[0.98] transition-all duration-500 shadow-xl shadow-gold/10">
              CREAR CUENTA
            </button>
          </form>

          <div className="mt-12">
            <div className="relative flex items-center justify-center mb-8">
              <div className="w-full border-t border-gold/10"></div>
              <span className="absolute px-4 bg-darker text-[10px] text-gray-500 uppercase tracking-[0.3em]">O continuar con</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="border border-gold/10 py-4 flex items-center justify-center gap-3 hover:bg-white/5 transition-colors group">
                <Apple size={18} className="text-gray-400 group-hover:text-gold" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Apple</span>
              </button>
              <button className="border border-gold/10 py-4 flex items-center justify-center gap-3 hover:bg-white/5 transition-colors group">
                <Mail size={18} className="text-gray-400 group-hover:text-gold" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Google</span>
              </button>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-gray-500 tracking-wider">
              ¿Ya tiene una cuenta? 
              <a href="#" className="text-gold font-bold ml-1 hover:underline underline-offset-4 transition-all uppercase">Inicie sesión</a>
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Nav (Mobile Only) */}
      <footer className="md:hidden bg-darker border-t border-gold/5 py-4 flex justify-around items-center">
        {['Heritage', 'Atelier', 'The Circle', 'Vault'].map((item) => (
          <div key={item} className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="w-1 h-1 bg-gold rounded-full mb-1"></div>
            <span className="text-[8px] uppercase tracking-widest text-gold">{item}</span>
          </div>
        ))}
      </footer>
    </motion.div>
  );
}
