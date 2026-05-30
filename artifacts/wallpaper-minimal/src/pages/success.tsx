import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function Success() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 18 }}
          className="mb-10 flex justify-center"
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#F0EDE8" }}>
            <CheckCircle2 strokeWidth={1.5} className="w-12 h-12" style={{ color: "#9E8E78" }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-xs uppercase tracking-[4px] mb-4" style={{ color: "#9E8E78" }}>
            WALLPAPER.MINIMAL
          </p>
          <h1 className="text-4xl font-serif italic mb-3" style={{ color: "#1A1A1A" }}>
            Payment Successful!
          </h1>
          <p className="text-base mb-1" style={{ color: "#555" }}>
            Thank you for your purchase.
          </p>
          <p className="text-base mb-2" style={{ color: "#555" }}>
            Check your email for your download link.
          </p>
          <p className="text-sm" style={{ color: "#9E8E78" }}>
            The email may take a few minutes to arrive.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Link
            href="/shop"
            className="inline-block px-12 py-4 bg-black text-white text-xs uppercase tracking-[3px] hover:bg-black/80 transition-colors"
          >
            BACK TO SHOP
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
