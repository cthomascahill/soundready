import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

/**
 * Thin promo strip at the very top of the public pages: the Artist Pro
 * early-bird offer, front and center before anything else.
 */
export default function EarlyBirdBanner({ to = "/pricing" }) {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-4 h-9 flex items-center justify-center">
        <Link to={to} className="group flex items-center gap-1.5 text-[11px] sm:text-xs font-bold tracking-wide">
          <Sparkles className="h-3 w-3 shrink-0" />
          <span>
            Early Bird Special · Artist Pro, just $9.99/month
          </span>
          <span className="hidden sm:inline underline underline-offset-2 opacity-90 group-hover:opacity-100">
            Get started
          </span>
        </Link>
      </div>
    </div>
  );
}