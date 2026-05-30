'use client';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-8">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-4xl text-gold mb-6">Error</h1>
        <p className="text-gray-400 text-sm mb-8">Ocurrió un error inesperado. Por favor intentá de nuevo.</p>
        <button onClick={reset} className="border border-gold/20 text-gold text-xs uppercase tracking-widest font-bold py-4 px-8 hover:bg-gold/10 transition-colors">
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
