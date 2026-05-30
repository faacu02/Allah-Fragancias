export default function Loading() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-xs uppercase tracking-widest">Cargando...</p>
      </div>
    </div>
  );
}
