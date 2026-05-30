import { useListWallpapers, getListWallpapersQueryKey, useGetCategories, getGetCategoriesQueryKey } from "@/lib/queries";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export function Shop() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [, navigate] = useLocation();

  const { data: categoriesData } = useGetCategories({
    query: { queryKey: getGetCategoriesQueryKey() },
  });

  const { data: wallpapers, isLoading } = useListWallpapers(
    { category: activeCategory !== "All" ? activeCategory : undefined },
    {
      query: {
        queryKey: getListWallpapersQueryKey(
          activeCategory !== "All" ? { category: activeCategory } : {}
        ),
      },
    }
  );

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-5xl font-serif italic text-center mb-12">Shop All</h1>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-4 py-2 text-sm rounded-full transition-colors ${
              activeCategory === "All"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {categoriesData?.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                activeCategory === cat.category
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.category} ({cat.count})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[9/19.5] bg-muted mb-4 rounded-sm" />
                <div className="h-4 bg-muted w-3/4 mb-2" />
                <div className="h-4 bg-muted w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {wallpapers?.map((wallpaper, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                key={wallpaper.id}
                className="group relative flex flex-col bg-card rounded-sm overflow-hidden border border-border hover:border-secondary transition-all shadow-sm cursor-pointer"
                onClick={() => navigate(`/wallpaper/${wallpaper.id}`)}
              >
                <div className="aspect-[9/19.5] relative overflow-hidden bg-muted">
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider px-2 py-1 z-10">
                    {wallpaper.category}
                  </div>
                  <img
                    src={wallpaper.image_url}
                    alt={wallpaper.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 flex flex-col items-center flex-1 justify-between text-center">
                  <h3 className="font-serif text-lg mb-1">{wallpaper.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    ${Number(wallpaper.price).toFixed(2)}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/wallpaper/${wallpaper.id}`);
                    }}
                    className="w-full py-2.5 bg-black text-white text-[10px] uppercase tracking-widest hover:bg-black/80 transition-colors"
                  >
                    GET THIS →
                  </button>
                </div>
              </motion.div>
            ))}
            {wallpapers?.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                No wallpapers found in this category.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
