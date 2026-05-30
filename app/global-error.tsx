'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body className="bg-dark text-white">
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="font-serif text-6xl text-gold">!</div>
            <h1 className="font-serif text-2xl text-gold">Error Crítico</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Ocurrió un error inesperado. Nuestro equipo ha sido notificado.
            </p>
            <button
              onClick={reset}
              className="bg-gold text-dark px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-gold-light transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
