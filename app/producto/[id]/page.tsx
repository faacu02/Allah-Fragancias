import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { env } from '@/lib/env';

const BASE_URL = env.NEXT_PUBLIC_BASE_URL;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { title: 'Producto no encontrado' };

  return {
    title: product.name,
    description: product.description?.slice(0, 160) || `Fragancia de la colección ${product.collection}`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160) || '',
      images: product.images?.[0] ? [{ url: product.images[0], width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description?.slice(0, 160) || '',
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const images = product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200'];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: images,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'ARS',
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              url: `${BASE_URL}/producto/${product.id}`,
            },
            brand: { '@type': 'Brand', name: 'Allah Fragancias' },
            category: product.collection,
          }),
        }}
      />
      <main className="min-h-screen bg-dark pt-20 pb-32">
        <nav className="fixed top-0 w-full z-50 bg-dark/60 backdrop-blur-xl flex justify-between items-center px-8 h-20 border-b border-gold/10">
          <Link href="/" className="text-gold hover:text-gold-light transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div className="font-serif text-xl font-bold tracking-[0.2em] text-gold uppercase">ALLAH FRAGANCIAS</div>
          <div className="w-6" />
        </nav>

        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-8 mt-8">
          <ol className="flex text-[10px] uppercase tracking-widest text-gray-400 gap-2">
            <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gold truncate max-w-[200px]" aria-current="page">{product.collection}</li>
            <li aria-hidden="true">/</li>
            <li className="text-gold/50 truncate max-w-[200px]" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="max-w-7xl mx-auto px-8 mt-8">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-1/2">
              <div className="aspect-[3/4] bg-darker overflow-hidden relative">
                <Image src={images[0]} alt={product.name} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold/60 mb-4">{product.collection}</p>
              <h1 className="font-serif text-4xl text-gold mb-4">{product.name}</h1>
              <p className="text-3xl text-gold-light font-bold mb-8">${product.price.toFixed(2)}</p>
              {product.description && (
                <p className="text-gray-400 text-sm leading-relaxed mb-8">{product.description}</p>
              )}
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-8">
                {product.stock > 5 ? 'En stock' : product.stock > 0 ? `Solo ${product.stock} uds.` : 'Agotado'}
              </p>
              <Link
                href="/"
                className="w-full bg-gold text-dark text-xs uppercase tracking-[0.3em] font-bold py-5 text-center hover:bg-gold-light transition-colors"
              >
                Volver a la Colección
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
