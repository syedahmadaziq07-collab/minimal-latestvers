import { useCreateCheckoutSession } from "@/lib/queries";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export function Bundles() {
  const checkoutMutation = useCreateCheckoutSession();

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto mb-16">
          {/* Starter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="border border-border p-8 rounded-sm bg-card flex flex-col h-full"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-medium mb-2">Starter Pack</h3>
              <p className="text-muted-foreground text-sm mb-6">A taste of minimalism</p>
              <div className="text-5xl font-serif italic mb-2">$12</div>
              <p className="text-sm text-muted-foreground">10 wallpapers</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm">
                <Check size={16} className="text-primary mt-0.5" />
                <span>10 curated aesthetic wallpapers</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check size={16} className="text-primary mt-0.5" />
                <span>4K resolution</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <XIcon size={16} className="mt-0.5" />
                <span>Future drops not included</span>
              </li>
            </ul>

            <button
              onClick={() => handleCheckout("pack", 12, "Starter Pack", "Starter Pack")}
              className="w-full py-4 border border-primary text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-colors mt-auto rounded-[2px]"
            >
              Get Starter Pack
            </button>
          </motion.div>

          {/* Cozy Pack */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="border border-secondary p-10 rounded-sm bg-primary text-primary-foreground relative shadow-2xl flex flex-col h-full min-h-[500px] z-10"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary text-primary text-[10px] uppercase tracking-wider px-4 py-1.5 font-bold rounded-[2px]">
              Most Popular
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-3xl font-medium mb-2">Cozy Pack</h3>
              <p className="text-primary-foreground/70 text-sm mb-6">Our signature aesthetic</p>
              <div className="text-6xl font-serif italic mb-2">$22</div>
              <p className="text-sm text-secondary">18 wallpapers</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1 text-primary-foreground/90">
              <li className="flex items-start gap-3 text-sm">
                <Check size={16} className="text-secondary mt-0.5" />
                <span>18 premium aesthetic wallpapers</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check size={16} className="text-secondary mt-0.5" />
                <span>4K & OLED optimized</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check size={16} className="text-secondary mt-0.5" />
                <span>Bonus: iPad versions included</span>
              </li>
            </ul>

            <button
              onClick={() => handleCheckout("pack", 22, "Cozy Pack", "Cozy Pack")}
              className="w-full py-4 bg-secondary text-primary font-medium text-xs uppercase tracking-widest hover:bg-[#b8a58d] transition-colors mt-auto rounded-[2px]"
            >
              Get The Pack
            </button>
          </motion.div>

          {/* All Access */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="border border-border p-8 rounded-sm bg-card flex flex-col h-full"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-medium mb-2">All Access</h3>
              <p className="text-muted-foreground text-sm mb-6">The ultimate collection</p>
              <div className="text-5xl font-serif italic mb-2">$45</div>
              <p className="text-sm text-muted-foreground">Unlimited wallpapers</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm">
                <Check size={16} className="text-primary mt-0.5" />
                <span>Every wallpaper currently in store</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check size={16} className="text-primary mt-0.5" />
                <span>All future drops included forever</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check size={16} className="text-primary mt-0.5" />
                <span>iPhone, iPad & Mac sizes</span>
              </li>
            </ul>

            <button
              onClick={() => handleCheckout("bundle", 45, "All Access", "All Access")}
              className="w-full py-4 border border-primary text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-colors mt-auto rounded-[2px]"
            >
              Get All Access
            </button>
          </motion.div>
        </div>

        <div className="text-center text-sm text-muted-foreground bg-muted p-6 rounded-sm max-w-2xl mx-auto">
          <p>Payments securely processed via Stripe. Download links are provided immediately after purchase and sent to your email.</p>
        </div>
      </div>
    </div>
  );
}

function XIcon({ className, ...props }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
