import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { trackPageView } from "@/lib/analytics";
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
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
