import { useState } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetWallpaper, getGetWallpaperQueryKey, useCreateCheckoutSession } from "@/lib/queries";
import { toast } from "sonner";
import { ZoomIn, X, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";

const BADGES = [
  { label: "4K Resolution" },
  { label: "OLED Optimized" },
  { label: "Instant Download" },
];

export function WallpaperDetail() {
  const [, params] = useRoute("/wallpaper/:id");
  const id = params?.id ?? "";

  const { data: wallpaper, isLoading, error } = useGetWallpaper(id, {
    query: { queryKey: getGetWallpaperQueryKey(id) },
  });

  const checkoutMutation = useCreateCheckoutSession();

  const allImages = wallpaper
    ? [wallpaper.image_url, ...(wallpaper.additional_images ?? []).filter(Boolean)]
    : [];

  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const handleBuy = () => {
    if (!wallpaper) return;
    checkoutMutation.mutate(
      {
        data: {
          type: "single",
          price: Number(wallpaper.price),
          name: wallpaper.name,
          wallpaper_id: wallpaper.id,
        },
      },
      {
        onSuccess: (res) => {
          window.location.href = res.url;
        },
        onError: (err: any) => {
          console.error("Checkout failed:", err);
          toast.error("Failed to initiate checkout. Please try again.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          <p className="text-sm uppercase tracking-widest text-[#9E8E78]">Loading</p>
        </div>
      </div>
    );
  }

  if (error || !wallpaper) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-white gap-6">
        <p className="text-lg font-serif italic text-[#1A1A1A]">Wallpaper not found.</p>
        <Link href="/shop" className="text-xs uppercase tracking-widest underline text-[#9E8E78]">
          Back to shop
        </Link>
      </div>
    );
  }

  const activeImage = allImages[activeIdx] ?? wallpaper.image_url;

  const prevImage = () => setActiveIdx((i) => (i - 1 + allImages.length) % allImages.length);
  const nextImage = () => setActiveIdx((i) => (i + 1) % allImages.length);

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Breadcrumb */}
      <div className="px-6 py-4 max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#9E8E78]">
          <Link href="/shop" className="hover:text-[#1A1A1A] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[#1A1A1A]">{wallpaper.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* ── Left: Image Gallery (60%) ── */}
          <div className="lg:w-[60%] flex flex-col gap-4">
            {/* Main image */}
            <div className="relative aspect-[9/16] md:aspect-[3/4] lg:aspect-[9/16] max-h-[75vh] overflow-hidden bg-[#F7F5F2] group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIdx}
                  src={activeImage}
                  alt={wallpaper.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-contain"
                />
              </AnimatePresence>

              {/* Nav arrows (only if multiple images) */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Fullscreen button */}
              <button
                onClick={() => setLightbox(true)}
                className="absolute top-3 right-3 w-9 h-9 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`flex-shrink-0 w-16 h-24 overflow-hidden border-2 transition-colors ${
                      i === activeIdx ? "border-[#1A1A1A]" : "border-transparent hover:border-[#D4C5B0]"
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info (40%) ── */}
          <div className="lg:w-[40%] flex flex-col justify-center lg:sticky lg:top-24 lg:self-start">
            {/* Tags */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {wallpaper.category && (
                <span className="px-3 py-1 text-[10px] uppercase tracking-widest border border-[#D4C5B0] text-[#9E8E78]">
                  {wallpaper.category}
                </span>
              )}
              {wallpaper.style && (
                <span className="px-3 py-1 text-[10px] uppercase tracking-widest border border-[#D4C5B0] text-[#9E8E78]">
                  {wallpaper.style}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="font-serif italic text-4xl md:text-5xl text-[#1A1A1A] leading-tight mb-4">
              {wallpaper.name}
            </h1>

            {/* Price */}
            <p className="text-3xl font-serif italic text-[#1A1A1A] mb-8">
              ${Number(wallpaper.price).toFixed(2)}
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-2 mb-10">
              {BADGES.map((b) => (
                <span
                  key={b.label}
                  className="px-3 py-1.5 bg-[#F7F5F2] text-[10px] uppercase tracking-widest text-[#1A1A1A]"
                >
                  {b.label}
                </span>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleBuy}
              disabled={checkoutMutation.isPending}
              className="w-full py-5 bg-[#1A1A1A] text-white text-xs uppercase tracking-[3px] hover:bg-black/80 transition-colors disabled:opacity-50 mb-3"
            >
              {checkoutMutation.isPending
                ? "Loading…"
                : `BUY NOW — $${Number(wallpaper.price).toFixed(2)}`}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#9E8E78]">
              <ShieldCheck size={13} />
              <span>Secure payment via Stripe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              onClick={() => setLightbox(false)}
            >
              <X size={20} />
            </button>
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            <img
              src={activeImage}
              alt={wallpaper.name}
              className="max-h-[90vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
