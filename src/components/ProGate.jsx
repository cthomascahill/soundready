import { useAuth } from "@/lib/AuthContext";
import { isProOrAbove } from "@/lib/tier";
import LapsedProCard, { isLapsedPro } from "@/components/LapsedProCard";
import CheckoutButton from "@/components/billing/CheckoutButton";
import { Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const UNLOCKS = [
  "The Studio — lyrics, ideas & beats",
  "Gig Finder — 1,341+ venues nationwide",
  "Tour Planner, Tour Finance & Venue Contracts",
  "The Wall — the artist community",
  "Team Chat + shared Whiteboard",
  "Genre Trends, Lyric Room & Studio",
  "Beat Pipeline & Artist Match — producer tools",
];

/**
 * Wraps a page so free-tier users see an Artist Pro upgrade screen
 * instead of the page content. Pro and AI Manager users pass through.
 */
export default function ProGate({ children, feature }) {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isProOrAbove(user)) return children;

  // Lapsed Pro users see their own locked data instead of the generic trial pitch
  if (isLapsedPro(user)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full">
          <LapsedProCard feature={feature} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg w-full">
        <div className="rounded-2xl border border-chart-5/20 bg-card p-8 space-y-6 relative pt-10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-chart-5 text-black">
            7-Day Free Trial
          </div>
          <div className="h-12 w-12 rounded-xl bg-chart-5/10 border border-chart-5/20 flex items-center justify-center">
            <Lock className="h-5 w-5 text-chart-5" />
          </div>
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-black">
              {feature ? `${feature} is part of Artist Pro` : "This is part of Artist Pro"}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your Vault, Productions, and trackers are free forever. Artist Pro unlocks the full toolkit — and it's free for 7 days.
            </p>
          </div>
          <div className="space-y-2">
            {UNLOCKS.map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-chart-5" />
                <span className="text-xs text-foreground">{item}</span>
              </div>
            ))}
          </div>
          <CheckoutButton tier="pro" className="bg-chart-5 hover:bg-chart-5/90 text-black">
            Start Pro
          </CheckoutButton>
          <p className="text-center text-xs text-muted-foreground">
            Card required — charged $39 automatically after 7 days. Cancel before then, pay nothing.
          </p>
          <p className="text-center">
            <Link to="/pricing-account" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
              See full pricing <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}