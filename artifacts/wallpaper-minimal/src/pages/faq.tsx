import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQ_DATA = [
  {
    section: "Getting Started",
    items: [
      {
        q: "How do I receive my wallpaper after purchase?",
        a: "After payment, you'll receive an email with your download link within a few minutes.",
      },
      {
        q: "What format are the wallpapers?",
        a: "All wallpapers are in high-quality JPG or PNG format, optimized for iPhone screens.",
      },
      {
        q: "What resolution are the wallpapers?",
        a: "All wallpapers are 4K resolution, perfectly sized for iPhone displays.",
      },
    ],
  },
  {
    section: "Compatibility",
    items: [
      {
        q: "Which iPhone models are supported?",
        a: "Our wallpapers work on all iPhone models including iPhone 12, 13, 14, 15, and 16 series.",
      },
      {
        q: "Can I use the wallpaper on both home and lock screen?",
        a: "Yes! All wallpapers are sized to work beautifully on both screens.",
      },
    ],
  },
  {
    section: "Payment & Refunds",
    items: [
      {
        q: "What payment methods are accepted?",
        a: "We accept all major credit and debit cards via Stripe secure checkout.",
      },
      {
        q: "Can I get a refund?",
        a: "Due to the digital nature of our products, we do not offer refunds after download. Please contact us if you have any issues.",
      },
      {
        q: "Is my payment secure?",
        a: "Yes, all payments are processed securely through Stripe.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E8E2DA]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-serif text-lg text-[#1A1A1A] group-hover:text-[#9E8E78] transition-colors pr-4">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-[#9E8E78]"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[#6B5E52] leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif italic mb-4 text-[#1A1A1A]">
            Frequently Asked Questions
          </h1>
          <p className="text-[#9E8E78]">
            Everything you need to know about WALLPAPER.MINIMAL
          </p>
        </div>

        <div className="space-y-12">
          {FAQ_DATA.map((section) => (
            <div key={section.section}>
              <h2 className="text-[10px] uppercase tracking-[4px] text-[#D4C5B0] mb-2">
                {section.section}
              </h2>
              <div>
                {section.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center p-8 bg-[#F7F5F2]">
          <p className="font-serif italic text-xl text-[#1A1A1A] mb-2">
            Still have questions?
          </p>
          <p className="text-[#9E8E78] text-sm mb-4">
            We're here to help.
          </p>
          <a
            href="/about"
            className="text-xs uppercase tracking-[3px] text-[#1A1A1A] underline underline-offset-4 hover:text-[#9E8E78] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
