'use client';

export default function ProductError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-dark pt-20 pb-32 flex items-center justify-center px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="font-serif text-2xl text-gold">Error al cargar el producto</h1>
        <p className="text-gray-400 text-sm">{error.message || 'Ocurrió un error inesperado.'}</p>
        <button onClick={reset} className="bg-gold text-dark px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-gold-light transition-colors">
          Intentar de nuevo
        </button>
      </div>
    </main>
  );
}
