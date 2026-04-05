import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          alt="Luxury Perfume" 
          className="w-full h-full object-cover opacity-60 scale-105"
          referrerPolicy="no-referrer"
          src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1920" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 px-8 md:px-24 max-w-4xl">
        <motion.span 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gold text-xs font-bold uppercase tracking-[0.4em] mb-4 block"
        >
          Nuestra Herencia
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-serif text-6xl md:text-8xl text-gold-light leading-tight mb-4 tracking-tighter"
        >
          Esencias del <br/>
          <span className="italic font-light">Desierto</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 text-lg md:text-xl font-light mb-12 tracking-widest uppercase"
        >
          Descubra el lujo en cada gota
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col md:flex-row gap-6"
        >
          <button className="bg-gold text-dark px-12 py-4 text-sm font-bold uppercase tracking-[0.2em] hover:bg-gold-light transition-all duration-500">
            Explorar Colección
          </button>
          <button className="border border-gold/30 text-gold px-12 py-4 text-sm font-bold uppercase tracking-[0.2em] hover:bg-gold/10 transition-all duration-500">
            Ver Video
          </button>
        </motion.div>
      </div>
    </section>
  );
}
