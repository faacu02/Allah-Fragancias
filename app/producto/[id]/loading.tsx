export default function Loading() {
  return (
    <main className="min-h-screen bg-dark pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-8 mt-8">
        <div className="flex flex-col md:flex-row gap-12 animate-pulse">
          <div className="w-full md:w-1/2">
            <div className="aspect-[3/4] bg-white/5" />
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center gap-6">
            <div className="h-3 bg-white/10 w-24" />
            <div className="h-10 bg-white/10 w-3/4" />
            <div className="h-8 bg-white/10 w-1/3" />
            <div className="h-20 bg-white/5 w-full" />
            <div className="h-12 bg-white/10 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
