import { Link } from "wouter";
import { usePageMeta } from "@/lib/usePageMeta";

export default function NotFound() {
  usePageMeta("404 — Page Not Found — WALLPAPER.MINIMAL");

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="text-[10px] uppercase tracking-[4px] text-[#9E8E78] mb-6">Error 404</p>
        <h1 className="font-serif italic text-6xl md:text-7xl text-[#1A1A1A] mb-4">Lost?</h1>
        <p className="text-[#6B5E52] mb-10 leading-relaxed">
          This page doesn't exist. Maybe it drifted away like a gentle breeze.
        </p>
        <Link
          href="/"
          className="inline-block px-10 py-4 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[3px] hover:bg-black/80 transition-colors"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}
