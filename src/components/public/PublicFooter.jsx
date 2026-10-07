import { Link } from "react-router-dom";
import SoundReadyLogo from "@/components/SoundReadyLogo";

/** Minimal shared footer for public pages: brand, key links, legal. */
export default function PublicFooter() {
  return (
    <footer className="border-t border-border/50 px-4 py-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/"><SoundReadyLogo size={20} /></Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
        </nav>
        <p className="text-xs text-muted-foreground">© 2026 SoundReady. All rights reserved.</p>
      </div>
    </footer>
  );
}