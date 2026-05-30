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
        className="max-w-md w-full bg-card p-10 text-center rounded-sm border border-border shadow-sm"
      >
        <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="text-secondary w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-serif italic mb-4">Thank You</h1>
        <p className="text-muted-foreground mb-8">
          Your payment was successful. We've sent the high-resolution files to your email address. 
          Please check your inbox (and spam folder) for the download link.
        </p>

        <div className="space-y-4">
          <Link 
            href="/shop" 
            className="block w-full py-4 bg-primary text-primary-foreground text-xs uppercase tracking-[3px] rounded-[2px] hover:bg-secondary transition-colors"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/" 
            className="block w-full py-4 bg-transparent text-primary border border-primary text-xs uppercase tracking-[3px] rounded-[2px] hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
