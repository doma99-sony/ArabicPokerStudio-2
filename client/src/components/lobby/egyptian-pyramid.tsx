
export function EgyptianPyramid() {
  return (
    <div className="relative w-full max-w-2xl mx-auto my-12 cursor-pointer group"
         onClick={() => window.location.href = '/game-tables'}>
      <div className="aspect-[4/3] bg-gradient-to-b from-[#D4AF37] to-[#C5A028] 
                    clip-pyramid transform hover:scale-105 transition-transform duration-300">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 drop-shadow-lg">
            بوكر بويا المصريين
          </h2>
          <p className="text-xl md:text-2xl text-black/80 font-semibold">
            انضم الآن
          </p>
        </div>
      </div>
    </div>
  );
}
