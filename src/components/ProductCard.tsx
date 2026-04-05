import { motion } from 'motion/react';

interface ProductProps {
  name: string;
  price: string;
  description: string;
  image: string;
  onClick?: () => void;
  key?: number | string;
}

export default function ProductCard({ name, price, description, image, onClick }: ProductProps) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      onClick={onClick}
      className="group relative p-8 border border-gold/10 hover:bg-white/5 transition-colors duration-700 cursor-pointer"
    >
      <div className="aspect-[3/4] bg-darker mb-8 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
        />
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-serif text-xl text-gold mb-2">{name}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest">{description}</p>
        </div>
        <span className="text-gold-light font-bold tracking-tighter">{price}</span>
      </div>
    </motion.div>
  );
}
