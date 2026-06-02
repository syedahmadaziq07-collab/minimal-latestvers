import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Download, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface FreeDownloadModalProps {
  open: boolean;
  onClose: () => void;
  wallpaper: { id: string; name: string; drive_url: string | null };
  onSuccess?: () => void;
}

export function FreeDownloadModal({ open, onClose, wallpaper, onSuccess }: FreeDownloadModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("free_downloads").insert({
        email,
        wallpaper_id: wallpaper.id,
        wallpaper_name: wallpaper.name,
      });
      if (error) throw error;
      try {
        await supabase.from("newsletter_subscribers").upsert(
          { email },
          { onConflict: "email", ignoreDuplicates: true }
        );
      } catch {
        // non-critical — newsletter subscribe is optional
      }
      setDone(true);
      onSuccess?.();
      setTimeout(() => {
        onClose();
        if (wallpaper.drive_url) {
          window.open(wallpaper.drive_url, "_blank", "noopener,noreferrer");
        }
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white p-10 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#9E8E78] hover:text-[#1A1A1A] transition-colors"
            >
              <X size={18} />
            </button>

            {done ? (
              <div className="text-center py-6">
                <CheckCircle size={40} className="mx-auto mb-4 text-green-600" />
                <h3 className="font-serif italic text-2xl text-[#1A1A1A] mb-2">You're all set!</h3>
                <p className="text-sm text-[#9E8E78]">
                  Your download will open in a new tab.
                </p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-[#F7F5F2] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Download size={20} className="text-[#9E8E78]" />
                </div>
                <h3 className="font-serif italic text-2xl text-center text-[#1A1A1A] mb-2">
                  Free Download
                </h3>
                <p className="text-center text-sm text-[#9E8E78] mb-8">
                  Enter your email to get{" "}
                  <span className="text-[#1A1A1A] font-medium">{wallpaper.name}</span> — free.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E8E78]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full border border-[#E8E2DA] pl-11 pr-4 py-3.5 text-sm bg-white outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[3px] hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 size={14} className="animate-spin" /> Processing…</>
                    ) : (
                      <><Download size={14} /> Get Download Link</>
                    )}
                  </button>
                </form>

                <p className="text-[10px] text-center text-[#9E8E78] mt-6">
                  We'll email you future free drops. Unsubscribe anytime.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
