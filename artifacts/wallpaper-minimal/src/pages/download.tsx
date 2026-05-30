import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Download as DownloadIcon, ExternalLink, Search, Mail } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";
import { supabase } from "@/lib/supabase";

interface DownloadItem {
  product: string;
  drive_url: string | null;
  date: string;
}

export function Download() {
  usePageMeta("My Downloads — WALLPAPER.MINIMAL", "Access your purchased wallpapers. Enter your email to find your download links.");

  const [email, setEmail] = useState("");
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !supabase) return;
    setLoading(true);
    setError("");
    setSearched(false);

    try {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_email", email)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const unique = [...new Set((orders ?? []).map((o) => o.product))];
      const results: DownloadItem[] = [];

      for (const product of unique) {
        const { data: wp } = await supabase
          .from("wallpapers")
          .select("drive_url")
          .eq("name", product)
          .single();

        const order = (orders ?? []).find((o) => o.product === product);
        results.push({
          product,
          drive_url: wp?.drive_url ?? null,
          date: order?.created_at ?? "",
        });
      }

      setItems(results);
      setSearched(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-[#F7F5F2] rounded-full flex items-center justify-center mx-auto mb-6">
            <DownloadIcon size={22} className="text-[#9E8E78]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic text-[#1A1A1A] mb-4">My Downloads</h1>
          <p className="text-[#9E8E78]">
            Enter the email you used at checkout to access your purchased wallpapers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-12">
          <div className="relative flex-1">
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
            className="px-8 py-3.5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[3px] hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Search size={14} />
            {loading ? "Searching\u2026" : "Find My Downloads"}
          </button>
        </form>

        {error && (
          <div className="text-center p-6 bg-red-50 border border-red-100 rounded-sm mb-8">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {searched && !loading && (
          <>
            {items.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#E8E2DA] rounded-sm">
                <p className="font-serif italic text-xl text-[#1A1A1A] mb-2">No purchases found</p>
                <p className="text-[#9E8E78] text-sm mb-6">
                  We couldn't find any completed purchases for this email.
                </p>
                <Link
                  href="/shop"
                  className="text-xs uppercase tracking-widest underline text-[#9E8E78] hover:text-[#1A1A1A] transition-colors"
                >
                  Browse Shop
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <motion.div
                    key={item.product}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-center justify-between p-5 border border-[#E8E2DA] rounded-sm hover:border-[#D4C5B0] transition-colors"
                  >
                    <div>
                      <h3 className="font-serif text-lg text-[#1A1A1A]">{item.product}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-[#9E8E78] mt-1">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    {item.drive_url ? (
                      <a
                        href={item.drive_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest hover:bg-black/80 transition-colors"
                      >
                        <ExternalLink size={13} />
                        Download
                      </a>
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest text-[#9E8E78]">
                        Unavailable
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-16 text-center text-xs text-[#9E8E78] leading-relaxed">
          <p>Your download links were also sent via email after purchase.</p>
          <p className="mt-1">
            If you need help,{" "}
            <Link href="/about" className="underline hover:text-[#1A1A1A] transition-colors">
              contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
