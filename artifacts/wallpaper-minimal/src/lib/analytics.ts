const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;

declare global {
  interface Window {
    gtag?: (command: string, id: string, params?: Record<string, unknown>) => void;
    dataLayer?: unknown[];
  }
}

export function trackPageView(path: string) {
  if (!GA_ID || typeof window.gtag !== "function") return;
  window.gtag("config", GA_ID, { page_path: path });
}

export function trackEvent(action: string, params?: Record<string, unknown>) {
  if (!GA_ID || typeof window.gtag !== "function") return;
  window.gtag("event", action, params);
}
