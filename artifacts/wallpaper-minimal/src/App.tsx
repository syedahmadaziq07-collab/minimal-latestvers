import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { trackPageView } from "@/lib/analytics";
import { CookieConsent } from "@/components/ui/CookieConsent";
import NotFound from "@/pages/not-found";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Home } from "@/pages/home";
import { Shop } from "@/pages/shop";
import { Collections } from "@/pages/collections";
import { Bundles } from "@/pages/bundles";
import { Success } from "@/pages/success";
import { Admin } from "@/pages/admin";
import { WallpaperDetail } from "@/pages/wallpaper-detail";
import { Faq } from "@/pages/faq";
import { About } from "@/pages/about";
import { Download } from "@/pages/download";

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;

function loadGA() {
  if (!GA_ID || document.querySelector("#ga-script")) return;
  const script = document.createElement("script");
  script.id = "ga-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer!.push(arguments); };
  window.gtag("js", new Date().toISOString());
  window.gtag("config", GA_ID, { send_page_view: false });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      throwOnError: false,
    },
    mutations: {
      throwOnError: false,
    },
  },
});

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    trackPageView(location);
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/collections" component={Collections} />
          <Route path="/bundles" component={Bundles} />
          <Route path="/wallpaper/:id" component={WallpaperDetail} />
          <Route path="/faq" component={Faq} />
          <Route path="/about" component={About} />
          <Route path="/success" component={Success} />
          <Route path="/admin" component={Admin} />
          <Route path="/download" component={Download} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(() => {
    const stored = localStorage.getItem("cookie-consent");
    if (stored === "accepted") return true;
    if (stored === "declined") return false;
    return null;
  });

  useEffect(() => {
    if (consentGiven === true) loadGA();
  }, [consentGiven]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <CookieConsent
          visible={consentGiven === null && !!GA_ID}
          onAccept={() => {
            localStorage.setItem("cookie-consent", "accepted");
            setConsentGiven(true);
          }}
          onDecline={() => {
            localStorage.setItem("cookie-consent", "declined");
            setConsentGiven(false);
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
