import { useAuth } from "@/lib/AuthContext";
import { hasAIManager } from "@/lib/tier";
import CheckoutButton from "@/components/billing/CheckoutButton";
import { Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AI_ITEMS } from "@/lib/plans";

/**
 * Wraps a page so anything under the AI Manager tab is only available to
 * AI Manager subscribers. Everyone else sees the AI Manager upgrade screen.
 */
export default function AiManagerGate({ children, feature }) {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (hasAIManager(user)) return children;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg w-full">
        <div className="rounded-2xl border border-primary/30 bg-card p-8 space-y-6 relative overflow-hidden pt-10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-primary text-primary-foreground">
            Founding Artist Price — Locked For Life
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-black">
              {feature ? `${feature} is part of AI Manager` : "This is part of AI Manager"}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Artist Pro unlocks the full toolkit. AI Manager adds Sam — the part that works your career around the clock.
            </p>
          </div>
          <div className="space-y-2">
            {AI_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <span className="text-xs text-foreground">{item}</span>
              </div>
            ))}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base text-muted-foreground line-through font-semibold">$79</span>
            <span className="font-heading text-3xl font-black text-primary">$59<span className="text-sm text-muted-foreground font-medium">/mo</span></span>
          </div>
          <CheckoutButton tier="ai_manager">
            Start AI Manager — $59/mo founding
          </CheckoutButton>
          <p className="text-center text-xs text-muted-foreground">
            Founding price locked for life while you stay subscribed. Everything in Artist Pro included. Cancel anytime.
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