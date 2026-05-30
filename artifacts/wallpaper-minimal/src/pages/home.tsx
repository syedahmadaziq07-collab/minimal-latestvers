import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { IPhoneMockup } from "@/components/ui/iPhoneMockup";
import {
  useListWallpapers,
  useGetCategories,
  useCreateCheckoutSession,
  useSubscribeNewsletter,
  getListWallpapersQueryKey,
  getGetCategoriesQueryKey,
} from "@/lib/queries";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check } from "lucide-react";

export function Home() {
  const [, navigate] = useLocation();

  const { data: drops } = useListWallpapers(
    { featured: true },
    { query: { queryKey: getListWallpapersQueryKey({ featured: true }) } }
  );

  const { data: categoriesData } = useGetCategories({
    query: { queryKey: getGetCategoriesQueryKey() },
  });
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const { data: moodWallpapers } = useListWallpapers(
    { category: activeCategory !== "All" ? activeCategory : undefined },
    {
      query: {
        queryKey: getListWallpapersQueryKey(
          activeCategory !== "All" ? { category: activeCategory } : {}
        ),
      },
    }
  );

  const checkoutMutation = useCreateCheckoutSession();
  const newsletterMutation = useSubscribeNewsletter();

  const handleBundleCheckout = (
    type: "single" | "pack" | "bundle",
    price: number,
    name: string,
    bundle_name?: string
  ) => {
    checkoutMutation.mutate(
      { data: { type, price, name, bundle_name } },
      {
        onSuccess: (res) => { window.location.href = res.url; },
        onError: () => { toast.error("Failed to initiate checkout"); },
      }
    );
  };

  const [email, setEmail] = useState("");
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    newsletterMutation.mutate(
      { data: { email } },
      {
        onSuccess: () => { toast.success("Subscribed successfully!"); setEmail(""); },
        onError: () => { toast.error("Failed to subscribe"); },
      }
    );
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Hero */}
      <section className="min-h-screen pt-24 pb-12 px-6 flex flex-col md:flex-row items-center container mx-auto max-w-7xl">
        <div className="flex-1 z-10 w-full mb-12 md:mb-0">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-serif italic mb-6 leading-tight"
          >
            Dress Your Screen, <br className="hidden md:block" />
            Softly.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-muted-foreground text-lg md:text-xl max-w-md mb-10 leading-relaxed"
          >
            Curated aesthetic wallpapers for your iPhone. Minimalist. Warm. Yours.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/shop"
              className="bg-primary text-primary-foreground px-8 py-4 text-[11px] uppercase tracking-[3px] rounded-[2px] hover:bg-secondary transition-colors duration-300"
            >
              Shop Now
            </Link>
            <Link
              href="/collections"
              className="bg-transparent text-primary border-[1.5px] border-primary px-8 py-4 text-[11px] uppercase tracking-[3px] rounded-[2px] hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              Browse Collections
            </Link>
          </motion.div>
        </div>
        <div className="flex-1 w-full flex justify-center relative">
          <IPhoneMockup />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-0 md:-right-10 bg-white/90 backdrop-blur text-primary text-xs px-4 py-2 rounded-full shadow-sm"
          >
            4K Resolution
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 left-0 md:-left-10 bg-white/90 backdrop-blur text-primary text-xs px-4 py-2 rounded-full shadow-sm"
          >
            Aesthetic
          </motion.div>
        </div>
      </section>

      {/* Featured Drops */}
      <section className="py-24 bg-card px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif italic mb-4">Latest Drops</h2>
            <p className="text-muted-foreground">New wallpapers, every week.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
            {(drops || []).slice(0, 6).map((wallpaper) => (
              <motion.div
                key={wallpaper.id}
                whileHover={{ y: -4 }}
                className="group relative flex flex-col bg-background rounded-sm overflow-hidden border border-border/50 hover:border-secondary transition-all duration-300 shadow-sm cursor-pointer"
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
                <div className="p-4 flex flex-col items-center flex-1 justify-between bg-white text-center">
                  <h3 className="font-serif text-xl mb-1">{wallpaper.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    ${Number(wallpaper.price).toFixed(2)}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/wallpaper/${wallpaper.id}`); }}
                    className="w-full py-2.5 bg-black text-white text-[10px] uppercase tracking-widest hover:bg-black/80 transition-colors"
                  >
                    GET THIS →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link
              href="/shop"
              className="inline-block border border-primary px-8 py-3 text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-colors"
            >
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* Mood Collections */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif italic mb-10">Shop by Mood</h2>
            <div className="flex flex-wrap justify-center gap-3">
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
                  {cat.category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(moodWallpapers || []).slice(0, 8).map((wallpaper) => (
              <div
                key={wallpaper.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/wallpaper/${wallpaper.id}`)}
              >
                <div className="aspect-[9/16] overflow-hidden mb-3 bg-muted rounded-sm">
                  <img
                    src={wallpaper.image_url}
                    alt={wallpaper.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h4 className="font-serif text-lg">{wallpaper.name}</h4>
                <p className="text-sm text-muted-foreground">${wallpaper.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* iPhone Showcase */}
      <section className="py-24 bg-[#F9F8F6] px-6">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 w-full flex justify-center">
            <IPhoneMockup />
          </div>
          <div className="flex-1 w-full">
            <h2 className="text-4xl md:text-5xl font-serif italic mb-12">Made for Your Screen</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium mb-2 flex items-center gap-3">
                  <Check className="text-secondary" size={20} /> 4K Resolution
                </h3>
                <p className="text-muted-foreground">
                  Every pixel, perfected. Crystal clear details that bring your screen to life.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 flex items-center gap-3">
                  <Check className="text-secondary" size={20} /> OLED Optimized
                </h3>
                <p className="text-muted-foreground">
                  True blacks and vivid contrast designed specifically for modern displays.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 flex items-center gap-3">
                  <Check className="text-secondary" size={20} /> Instant Download
                </h3>
                <p className="text-muted-foreground">
                  Yours in seconds. Check out securely and get immediate access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bundles */}
      <section className="py-24 px-6 bg-white" id="pricing">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif italic mb-4">Aesthetic Bundles</h2>
            <p className="text-muted-foreground">Simple Pricing</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            <div className="border border-border p-8 rounded-sm bg-card text-center">
              <h3 className="text-xl font-medium mb-2">Single</h3>
              <p className="text-muted-foreground text-sm mb-6">1 wallpaper</p>
              <div className="text-4xl font-serif italic mb-8">$4</div>
              <Link
                href="/shop"
                className="block w-full py-3 border border-primary text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-colors"
              >
                Browse Shop
              </Link>
            </div>

            <div className="border border-secondary p-10 rounded-sm bg-primary text-primary-foreground text-center relative transform md:scale-105 shadow-xl z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary text-primary text-[10px] uppercase tracking-wider px-3 py-1 font-bold">
                Most Popular
              </div>
              <h3 className="text-2xl font-medium mb-2">Essential Set</h3>
              <p className="text-primary-foreground/70 text-sm mb-6">18 wallpapers</p>
              <div className="text-5xl font-serif italic mb-8">$17.99</div>
              <button
                onClick={() => handleBundleCheckout("pack", 17.99, "Essential Set", "Essential Set")}
                disabled={checkoutMutation.isPending}
                className="w-full py-4 bg-secondary text-primary font-medium text-xs uppercase tracking-widest hover:bg-[#b8a58d] transition-colors rounded-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutMutation.isPending ? "Loading…" : "Get Essential Set"}
              </button>
            </div>

            <div className="border border-border p-8 rounded-sm bg-card text-center">
              <h3 className="text-xl font-medium mb-2">Full Collection</h3>
              <p className="text-muted-foreground text-sm mb-6">Everything + future drops</p>
              <div className="text-4xl font-serif italic mb-8">$29.99</div>
              <button
                onClick={() => handleBundleCheckout("bundle", 29.99, "Full Collection", "Full Collection")}
                disabled={checkoutMutation.isPending}
                className="w-full py-3 border border-primary text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutMutation.isPending ? "Loading…" : "Get Full Collection"}
              </button>
            </div>
          </div>
          <div className="text-center mt-12 text-sm text-muted-foreground">
            Secure checkout via Stripe · Instant download
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-6 bg-[#D4C5B0]">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-serif italic mb-4 text-primary">
            Get First Access to New Drops
          </h2>
          <p className="text-primary/70 mb-10">
            Join the inner circle for exclusive wallpapers and aesthetic inspiration.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-none h-12 rounded-[2px]"
              required
            />
            <Button
              type="submit"
              disabled={newsletterMutation.isPending}
              className="bg-primary text-white h-12 px-8 text-xs uppercase tracking-[3px] rounded-[2px] hover:bg-[#111]"
            >
              Notify Me
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
