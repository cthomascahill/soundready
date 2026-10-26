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
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full">
        <div className="rounded-2xl border border-primary/30 bg-card p-6 sm:p-7 space-y-5 relative pt-9">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-primary text-primary-foreground">
            Early Bird Special · $37 Lifetime Access
          </div>
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1 min-w-0">
              <h1 className="font-heading text-xl sm:text-2xl font-black leading-tight">
                {feature ? `${feature} is part of Digital Manager` : "This is part of Digital Manager"}
              </h1>
              <p className="text-sm text-muted-foreground leading-snug">
                Artist Pro unlocks the full toolkit. Digital Manager adds Sam, the part that works your career around the clock.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {AI_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <span className="text-xs text-foreground">{item}</span>
              </div>
            ))}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base text-muted-foreground line-through font-semibold">$89</span>
            <span className="font-heading text-3xl font-black text-primary">$37<span className="text-sm text-muted-foreground font-medium"> once, for life</span></span>
          </div>
          <CheckoutButton tier="ai_manager_lifetime">
            Get Lifetime Access, $37 early bird
          </CheckoutButton>
          <p className="text-center text-xs text-muted-foreground">
            One-time payment, lifetime access. Everything in Artist Pro included. 2,500 SAM credits included monthly, top up anytime.
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