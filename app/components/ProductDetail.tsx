'use client';

import { motion } from 'motion/react';
import { ShoppingBag, ArrowLeft, Star, Trees, Waves, Diamond, Flower2 } from 'lucide-react';

interface ProductDetailProps {
  onBack: () => void;
  key?: string;
}

export default function ProductDetail({ onBack }: ProductDetailProps) {
  // In a real app, this data would come from props or state
  const productData = {
    name: "Oud Al-Malik",
    description: "A fragrance that transcends time, capturing the majestic soul of the Orient. Oud Al-Malik is an olfactory journey through sacred temples and royal courts.",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200",
    brand: "Allah Fragancias",
    sku: "OUD-AL-MALIK-001",
    category: "The Mirage Collection",
    offers: {
      price: 240.00,
      priceCurrency: "USD",
      availability: "http://schema.org/InStock"
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-dark pt-20 pb-32"
    >
      {/* JSON-LD Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          name: productData.name,
          description: productData.description,
          image: productData.image,
          brand: {
            "@type": "Brand",
            name: productData.brand
          },
          sku: productData.sku,
          category: productData.category,
          offers: {
            "@type": "Offer",
            url: window.location.href,
            priceCurrency: productData.offers.priceCurrency,
            price: productData.offers.price,
            itemCondition: "https://schema.org/NewCondition",
            availability: productData.offers.availability
          }
        })}
      </script>
      <nav className="fixed top-0 w-full z-50 bg-dark/60 backdrop-blur-xl flex justify-between items-center px-8 h-20 border-b border-gold/10">
        <button onClick={onBack} className="text-gold cursor-pointer hover:text-gold-light transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="font-serif text-xl font-bold tracking-[0.2em] text-gold uppercase">ALLAH FRAGANCIAS</div>
        <button className="text-gold cursor-pointer hover:text-gold-light transition-colors">
          <ShoppingBag size={24} />
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row gap-12 mb-32">
          <div className="w-full md:w-1/2 aspect-[3/4] bg-darker overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200" 
              alt="Oud Al-Malik"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <nav className="flex gap-2 text-[10px] tracking-widest uppercase text-gray-500 mb-8">
              <span>Collection</span>
              <span>/</span>
              <span>The Mirage</span>
            </nav>
            <h1 className="text-6xl md:text-8xl font-serif font-bold text-gold tracking-tighter mb-4 leading-none">
              Oud Al-Malik
            </h1>
            <p className="text-xl md:text-2xl font-serif text-gray-400 mb-6 italic">
              Essence of Sandalwood &amp; Oud
            </p>
            <div className="text-3xl font-serif text-gold-light mb-10">$240</div>
            
            <div className="space-y-8 max-w-md">
              <p className="text-gray-400 leading-relaxed">
                A fragrance that transcends time, capturing the majestic soul of the Orient. Oud Al-Malik is an olfactory journey through sacred temples and royal courts.
              </p>
              <div className="flex flex-col gap-4">
                <button className="w-full py-5 bg-gold text-dark font-bold uppercase tracking-[0.2em] hover:bg-gold-light transition-all duration-500">
                  Add to Cart
                </button>
                <button className="w-full py-5 border border-gold/30 text-gold font-bold uppercase tracking-[0.2em] hover:bg-gold/10 transition-all">
                  Bespoke Consultation
                </button>
              </div>
            </div>
          </div>
        </div>

        <section className="py-24 border-y border-gold/10 mb-32">
          <h2 className="text-xs uppercase tracking-[0.4em] text-gold mb-16 text-center">Olfactory Notes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gold/10">
            {[
              { icon: <Trees size={32} />, title: "Rare Oud", desc: "Sourced from Aged Aquilaria" },
              { icon: <Flower2 size={32} />, title: "Sandalwood", desc: "Creamy Mysore Core" },
              { icon: <Waves size={32} />, title: "Saffron", desc: "Crimson Grade Threads" },
              { icon: <Diamond size={32} />, title: "Amber", desc: "Fossilized Warmth" }
            ].map((note, i) => (
              <div key={i} className="bg-dark p-12 flex flex-col items-center text-center group">
                <div className="text-gold mb-6 group-hover:scale-110 transition-transform duration-500">
                  {note.icon}
                </div>
                <h3 className="font-serif text-xl mb-2 text-white">{note.title}</h3>
                <p className="text-xs text-gray-500 tracking-widest">{note.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col md:flex-row items-center gap-20 mb-32">
          <div className="w-full md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=1200" 
              alt="Desert"
              referrerPolicy="no-referrer"
              className="w-full aspect-video md:aspect-[4/5] object-cover grayscale"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8">The Story</h2>
            <p className="text-xl font-serif italic text-gold mb-8 leading-relaxed">
              &quot;A fragrance inspired by the ancient desert winds.&quot;
            </p>
            <div className="space-y-6 text-gray-400 leading-relaxed">
              <p>In the heart of the Rub&apos; al Khali, where time stands still and the dunes sing secrets of empires long passed, Oud Al-Malik was conceived.</p>
              <p>We sought to capture the fleeting moment when the sun dips below the horizon, and the scorching heat gives way to a crystalline, aromatic chill. It is the scent of nomadic royalty—commanding, mysterious, and profoundly deep.</p>
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Patron Chronicles</h2>
              <h3 className="text-4xl font-serif">Reviews</h3>
            </div>
            <div className="text-right">
              <div className="flex gap-1 text-gold mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-xs tracking-widest text-gray-500">4.9 Average / 128 Reviews</p>
            </div>
          </div>
          <div className="space-y-16">
            {[
              { name: "Julian V.", date: "Oct 24, 2023", title: "A Masterpiece of Balance", text: "The oud is prominent but never overpowering. It settles into a creamy sandalwood that lasts for over 12 hours on my skin. Truly regal." },
              { name: "Elena R.", date: "Sep 12, 2023", title: "Evocative and Enigmatic", text: "It smells like wealth and mystery. Every time I wear it, I'm asked what it is. The saffron adds a spicy edge that is just addictive." }
            ].map((review, i) => (
              <div key={i} className="border-b border-gold/5 pb-12 last:border-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-1 text-gold scale-75 origin-left">
                    {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">{review.date}</span>
                </div>
                <h4 className="font-serif text-lg mb-2">{review.title}</h4>
                <p className="text-gray-400 italic leading-relaxed">&quot;{review.text}&quot;</p>
                <p className="mt-4 text-[10px] uppercase tracking-widest text-gold">— {review.name}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </motion.div>
  );
}
