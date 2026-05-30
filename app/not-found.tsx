'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-8">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-5xl text-gold mb-4">404</h1>
        <p className="text-gray-400 text-sm mb-8">La página que buscás no existe.</p>
        <Link href="/" className="inline-block border border-gold/20 text-gold text-xs uppercase tracking-widest font-bold py-4 px-8 hover:bg-gold/10 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
