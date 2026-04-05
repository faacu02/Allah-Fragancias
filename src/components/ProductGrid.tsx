import ProductCard from './ProductCard';

const PRODUCTS = [
  {
    name: "Oud Al-Malik",
    price: "$280",
    description: "Esencia de Sándalo & Oud",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Sultán Mirage",
    price: "$350",
    description: "Ámbar Gris & Azafrán",
    image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Rosa del Desierto",
    price: "$210",
    description: "Rosa Damascena & Musk",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800"
  }
];

export default function ProductGrid() {
  return (
    <section className="py-32 px-8 md:px-24 bg-dark">
      <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
        <div>
          <span className="text-gold text-xs font-bold uppercase tracking-[0.4em] mb-4 block">Selected Works</span>
          <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tighter">Colección Obsidian</h2>
        </div>
        <p className="max-w-md text-gray-400 font-light leading-relaxed">
          Una curaduría de los aromas más raros y preciosos del Oriente Medio, embotellados en cristal tallado a mano.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PRODUCTS.map((product, index) => (
          <ProductCard 
            key={index} 
            name={product.name}
            price={product.price}
            description={product.description}
            image={product.image}
          />
        ))}
      </div>
    </section>
  );
}
