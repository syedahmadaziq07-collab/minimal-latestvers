import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-20 px-6">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="font-serif text-2xl tracking-wide italic mb-4 block">
            WALLPAPER.MINIMAL
          </Link>
          <p className="text-sm text-primary-foreground/70 mb-6">
            Dress your screen, softly.
          </p>
        </div>

        <div>
          <h4 className="text-[11px] uppercase tracking-[3px] mb-6 text-primary-foreground/50">Shop</h4>
          <ul className="space-y-4 text-sm">
            <li><Link href="/shop" className="hover:text-secondary transition-colors">All Wallpapers</Link></li>
            <li><Link href="/collections" className="hover:text-secondary transition-colors">Collections</Link></li>
            <li><Link href="/bundles" className="hover:text-secondary transition-colors">Bundles</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] uppercase tracking-[3px] mb-6 text-primary-foreground/50">Help</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-secondary transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] uppercase tracking-[3px] mb-6 text-primary-foreground/50">Follow</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-secondary transition-colors">Instagram</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Pinterest</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Twitter</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto max-w-6xl mt-16 pt-8 border-t border-primary-foreground/10 text-xs text-primary-foreground/50 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
        <p>© 2025 WALLPAPER.MINIMAL. All rights reserved.</p>
        <div className="mt-4 md:mt-0 flex gap-4">
          <span>Stripe Secure</span>
          <span>Instant Download</span>
        </div>
      </div>
    </footer>
  );
}
