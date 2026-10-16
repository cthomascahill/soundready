import { Link } from "react-router-dom";
import { Instagram, ShieldCheck } from "lucide-react";
import SoundReadyLogo from "@/components/SoundReadyLogo";

/** Shared footer for public pages: brand, key links, legal, and trust signals. */
export default function PublicFooter() {
  return (
    <footer className="px-4 py-8">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/"><SoundReadyLogo size={20} /></Link>
          <nav className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <a href="mailto:support@soundready.ai" className="hover:text-foreground transition-colors">Contact & Support</a>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <a href="https://www.instagram.com/soundreadyai" target="_blank" rel="noopener noreferrer"
              aria-label="SoundReady on Instagram"
              className="text-muted-foreground hover:text-foreground transition-colors">
              <Instagram className="h-4.5 w-4.5" />
            </a>
          </nav>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Payments secured by Stripe · Cancel anytime
        </p>
        <p className="text-xs text-muted-foreground">© 2026 SoundReady LLC · Miami, FL. All rights reserved.</p>
      </div>
    </footer>
  );
}