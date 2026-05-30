import { useListBundles, getListBundlesQueryKey, useCreateCheckoutSession } from "@/lib/queries";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const FALLBACK_BUNDLES = [
  { name: "Starter Pack", description: "A taste of minimalism", price: 9.99, wallpaper_count: 10, is_popular: false, is_active: true },
  { name: "Essential Set", description: "Our signature aesthetic", price: 17.99, wallpaper_count: 18, is_popular: true, is_active: true },
  { name: "Full Collection", description: "The ultimate collection", price: 29.99, wallpaper_count: 999, is_popular: false, is_active: true },
];

const PERKS: Record<string, string[]> = {
  "Starter Pack": ["10 curated aesthetic wallpapers", "4K resolution"],
  "Essential Set": ["18 premium aesthetic wallpapers", "4K & OLED optimized", "Bonus: iPad versions included"],
  "Full Collection": ["Every wallpaper currently in store", "All future drops included forever", "iPhone, iPad & Mac sizes"],
};

export function Bundles() {
  const checkoutMutation = useCreateCheckoutSession();
  const { data: supabaseBundles, isLoading } = useListBundles({ query: { queryKey: getListBundlesQueryKey() } });

  const bundles = (supabaseBundles ?? []).filter(b => b.is_active).length > 0
    ? (supabaseBundles ?? []).filter(b => b.is_active)
    : FALLBACK_BUNDLES;

  const handleCheckout = (
    type: "single" | "pack" | "bundle",
    price: number,
    name: string,
    bundle_name?: string
  ) => {
    checkoutMutation.mutate(
      { data: { type, price, name, bundle_name } },
      {
        onSuccess: (res) => {
          window.location.href = res.url;
        },
        onError: () => {
          toast.error("Failed to initiate checkout");
        },
      }
    );
  };

  const getType = (bundle: typeof bundles[0]) => {
    if (bundle.price >= 25) return "bundle" as const;
    if (bundle.price >= 10) return "pack" as const;
    return "single" as const;
  };

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-serif italic mb-6"
          >
            Aesthetic Bundles
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-lg mx-auto"
          >
            Upgrade your entire ecosystem in one click. Curated collections for a unified aesthetic.
          </motion.p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse border border-border p-8 rounded-sm bg-card h-[450px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-5xl mx-auto mb-16">
            {bundles.map((bundle, i) => {
              const isPopular = bundle.is_popular;
              const type = getType(bundle);
              const perks = PERKS[bundle.name] ?? [`${bundle.wallpaper_count} curated wallpapers`, "4K resolution"];

              const CardWrapper = isPopular
                ? motion.div
                : motion.div;
              const cardClass = isPopular
                ? "border border-secondary p-10 rounded-sm bg-primary text-primary-foreground relative shadow-2xl flex flex-col z-10 md:scale-105"
                : "border border-border p-8 rounded-sm bg-card flex flex-col";

              return (
                <CardWrapper
                  key={bundle.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className={cardClass}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary text-primary text-[10px] uppercase tracking-wider px-4 py-1.5 font-bold rounded-[2px]">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className={isPopular ? "text-3xl font-medium mb-2" : "text-2xl font-medium mb-2"}>{bundle.name}</h3>
                    <p className={`text-sm mb-6 ${isPopular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{bundle.description}</p>
                    <div className={`${isPopular ? "text-6xl" : "text-5xl"} font-serif italic mb-2`}>${bundle.price}</div>
                    <p className={`text-sm ${isPopular ? "text-secondary" : "text-muted-foreground"}`}>{bundle.wallpaper_count >= 100 ? "Unlimited wallpapers" : `${bundle.wallpaper_count} wallpapers`}</p>
                  </div>

                  <ul className={`space-y-4 mb-8 flex-1 ${isPopular ? "text-primary-foreground/90" : ""}`}>
                    {perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-3 text-sm">
                        <Check size={16} className={`mt-0.5 ${isPopular ? "text-secondary" : "text-primary"}`} />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleCheckout(type, bundle.price, bundle.name, bundle.name)}
                    disabled={checkoutMutation.isPending}
                    className={`w-full py-4 text-xs uppercase tracking-widest transition-colors mt-auto rounded-[2px] disabled:opacity-50 disabled:cursor-not-allowed ${
                      isPopular
                        ? "bg-secondary text-primary font-medium hover:bg-[#b8a58d]"
                        : "border border-primary hover:bg-primary hover:text-white"
                    }`}
                  >
                    {checkoutMutation.isPending ? "Loading\u2026" : `Get ${bundle.name}`}
                  </button>
                </CardWrapper>
              );
            })}
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground bg-muted p-6 rounded-sm max-w-2xl mx-auto">
          <p>Payments securely processed via Stripe. Download links are provided immediately after purchase and sent to your email.</p>
        </div>
      </div>
    </div>
  );
}
