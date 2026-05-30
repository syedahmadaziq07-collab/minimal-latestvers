import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Package, Zap, Download } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

const OFFERS = [
  { icon: Check, label: "Handpicked aesthetic wallpapers" },
  { icon: Zap, label: "4K resolution for crystal clarity" },
  { icon: Package, label: "New drops every week" },
  { icon: Download, label: "Instant digital delivery" },
];

export function About() {
  usePageMeta(
    "About — WALLPAPER.MINIMAL",
    "Learn about WALLPAPER.MINIMAL — curated aesthetic wallpapers for your iPhone. Born from a love of clean, beautiful design."
  );
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      setForm({ name: "", email: "", message: "" });
      toast.success("Message sent! We'll get back to you soon.");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-40 pb-24 px-6 bg-[#F7F5F2]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-6xl font-serif italic text-[#1A1A1A] mb-6"
          >
            About WALLPAPER.MINIMAL
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-lg text-[#9E8E78] leading-relaxed"
          >
            Curated aesthetic wallpapers for those who care about every detail.
          </motion.p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[4px] text-[#D4C5B0] mb-4">Our Story</p>
              <p className="font-serif italic text-3xl text-[#1A1A1A] leading-snug mb-6">
                Born from a love of clean, beautiful design.
              </p>
              <p className="text-[#6B5E52] leading-relaxed">
                WALLPAPER.MINIMAL was born from a love of clean, beautiful design. Every wallpaper
                in our collection is carefully curated to bring calm and beauty to your screen.
              </p>
            </div>
            <div className="aspect-square bg-[#D4C5B0]/30 flex items-center justify-center">
              <span className="font-serif italic text-4xl text-[#D4C5B0]">W.M</span>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-24 px-6 bg-[#F7F5F2]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] uppercase tracking-[4px] text-[#D4C5B0] mb-4 text-center">What We Offer</p>
          <h2 className="text-4xl font-serif italic text-center text-[#1A1A1A] mb-16">
            Designed for your screen
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {OFFERS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#D4C5B0]/30 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-[#9E8E78]" />
                </div>
                <p className="text-[#1A1A1A] font-medium leading-tight mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 px-6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-[4px] text-[#D4C5B0] mb-4">Get In Touch</p>
            <h2 className="text-4xl font-serif italic text-[#1A1A1A] mb-4">
              We'd love to hear from you
            </h2>
            <p className="text-[#9E8E78]">
              Have a question or request?
            </p>
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-block mt-3 text-sm text-[#1A1A1A] underline underline-offset-4 hover:text-[#9E8E78] transition-colors"
              >
                {contactEmail}
              </a>
            )}
          </div>

          {sent ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-[#D4C5B0]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={20} className="text-[#9E8E78]" />
              </div>
              <p className="font-serif italic text-xl text-[#1A1A1A]">Message sent!</p>
              <p className="text-[#9E8E78] text-sm mt-2">We'll get back to you shortly.</p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-xs uppercase tracking-widest underline text-[#9E8E78] hover:text-[#1A1A1A] transition-colors"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-[3px] text-[#9E8E78] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-[#E8E2DA] px-4 py-3 text-sm bg-white outline-none focus:border-[#1A1A1A] transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[3px] text-[#9E8E78] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-[#E8E2DA] px-4 py-3 text-sm bg-white outline-none focus:border-[#1A1A1A] transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[3px] text-[#9E8E78] mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border border-[#E8E2DA] px-4 py-3 text-sm bg-white outline-none focus:border-[#1A1A1A] transition-colors resize-none"
                  placeholder="Tell us what's on your mind…"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-4 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[3px] hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
