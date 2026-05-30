import { useEffect } from "react";

export function usePageMeta(title: string, description?: string, ogImage?: string) {
  useEffect(() => {
    document.title = title;

    const desc = description || "Curated aesthetic wallpapers for your iPhone. Minimalist. Warm. Yours.";
    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", desc);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", desc);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", desc);

    if (ogImage) {
      let el = document.querySelector('meta[property="og:image"]');
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", "og:image");
        document.head.appendChild(el);
      }
      el.setAttribute("content", ogImage);
    }
  }, [title, description, ogImage]);
}
