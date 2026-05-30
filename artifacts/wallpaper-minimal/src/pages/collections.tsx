import { useGetCategories, getGetCategoriesQueryKey } from "@/lib/queries";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { usePageMeta } from "@/lib/usePageMeta";

export function Collections() {
  usePageMeta(
    "Mood Collections — WALLPAPER.MINIMAL",
    "Browse our curated mood collections: Minimalist, Japan, Nature, Pastel, Cozy, Architecture. Find the perfect aesthetic for your screen."
  );
  const { data: categories, isLoading } = useGetCategories({
    query: { queryKey: getGetCategoriesQueryKey() }
  });

  // Placeholder images for collections since the API doesn't return collection cover images directly
  const collectionImages: Record<string, string> = {
    Minimalist: "/placeholder-4.png",
    Japan: "/placeholder-2.png",
    Nature: "/placeholder-3.png",
    Pastel: "/placeholder-1.png",
    Cozy: "/placeholder-3.png",
    Architecture: "/placeholder-4.png",
    Default: "/placeholder-1.png"
  };

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif italic mb-4">Mood Collections</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Curated aesthetics to match your current vibe. Find the perfect atmosphere for your screen.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories?.map((cat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                key={cat.category}
              >
                <Link href={`/shop?category=${cat.category}`} className="group block relative overflow-hidden rounded-sm aspect-[4/3] bg-muted">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10" />
                  <img 
                    src={collectionImages[cat.category] || collectionImages.Default} 
                    alt={cat.category}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center z-20 pointer-events-none">
                    <span className="text-white/35 text-[7px] uppercase tracking-[2px] font-sans select-none">WALLPAPER.MINIMAL</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white p-6 text-center">
                    <h2 className="text-4xl font-serif italic mb-2 drop-shadow-md">{cat.category}</h2>
                    <p className="text-sm uppercase tracking-widest drop-shadow-md">{cat.count} Wallpapers</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
