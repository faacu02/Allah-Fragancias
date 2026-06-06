'use client';

import { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&q=80&w=1920",
];

interface CarouselImage {
  id: string;
  imageUrl: string;
  title: string;
  order: number;
}

interface HeroProps {
  onExploreClick?: () => void;
}

function Hero({ onExploreClick }: HeroProps) {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchCarousel() {
      try {
        const res = await fetch('/api/carousel', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          console.log('[Hero] Carousel data:', data);
          setCarouselImages(data.length > 0 ? data : []);
        }
      } catch (err) {
        console.log('[Hero] Error fetching carousel:', err);
      }
    }
    fetchCarousel();
    // Refresh every 10 seconds to catch admin changes
    const interval = setInterval(fetchCarousel, 10000);
    return () => clearInterval(interval);
  }, []);

  const images = carouselImages.length > 0 ? carouselImages : FALLBACK_IMAGES.map((url, i) => ({ id: String(i), imageUrl: url, title: '', order: i }));

  useEffect(() => {
    if (isPaused || images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, images.length]);

  useEffect(() => {
    if (images.length === 0) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
        setIsPaused(true);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % images.length);
        setIsPaused(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images.length]);

  const visibleIndices = (() => {
    if (images.length === 0) return new Set<number>();
    const prev = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    const next = (currentIndex + 1) % images.length;
    return new Set([prev, currentIndex, next]);
  })();

  return (
    <section
      className="relative min-h-[500px] h-screen flex items-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carrusel"
      aria-label="Galería de fragancias"
    >
      <div className="absolute inset-0 z-0">
        {images.map((item, idx) => visibleIndices.has(idx) ? (
          <Image
            key={item.id}
            src={item.imageUrl}
            alt={item.title || ''}
            fill
            className={`object-cover scale-105 transition-opacity duration-1000 ${idx === currentIndex ? 'opacity-60' : 'opacity-0 pointer-events-none'}`}
            priority={idx === 0}
            sizes="100vw"
          />
        ) : null)}
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-transparent to-dark"></div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4">
        {/* Image title */}
        <motion.p 
          key={`title-${currentIndex}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-gold text-lg md:text-xl uppercase tracking-[0.3em] font-serif font-bold drop-shadow-lg"
        >
          {images[currentIndex]?.title || `Slide ${currentIndex + 1}`}
        </motion.p>
        
        <div className="flex gap-3 items-center">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-11 h-11 rounded-full transition-all duration-300 flex items-center justify-center ${idx === currentIndex ? 'bg-gold' : 'bg-white/40 hover:bg-white/70'}`}
              aria-label={`Ir a imagen ${idx + 1}`}
              aria-current={idx === currentIndex ? 'true' : undefined}
            >
              <span className={`block w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-dark' : ''}`} />
            </button>
          ))}
          <button
            onClick={() => setIsPaused(p => !p)}
            className="ml-4 px-3 py-3 border border-gold/30 text-gold text-[10px] uppercase tracking-widest hover:bg-gold/10 transition-colors"
            aria-label={isPaused ? 'Reanudar carrusel' : 'Pausar carrusel'}
          >
            {isPaused ? '▶' : '❚❚'}
          </button>
        </div>
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
          className="font-serif text-4xl sm:text-6xl md:text-8xl text-gold-light leading-tight mb-4 tracking-tighter"
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
          <button onClick={onExploreClick} className="bg-gold text-dark px-12 py-4 text-sm font-bold uppercase tracking-[0.2em] hover:bg-gold-light transition-all duration-500">
            Explorar Colección
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default memo(Hero);
