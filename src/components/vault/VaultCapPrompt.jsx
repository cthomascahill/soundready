import { Link } from "react-router-dom";
import { Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FREE_VAULT_CAP = 5;

// Small "X of 5 used" pill shown near the Add button for free-tier users
export function VaultUsageBadge({ count, label }) {
  const full = count >= FREE_VAULT_CAP;
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap ${
        full
          ? "bg-chart-5/10 text-chart-5 border-chart-5/30"
          : "bg-secondary text-muted-foreground border-border"
      }`}
    >
      {count} of {FREE_VAULT_CAP} {label} · free plan
    </span>
  );
}

// Friendly upgrade prompt shown instead of the add form when the cap is hit.
// Nothing is lost — existing records stay readable, editable, deletable.
export default function VaultCapPrompt({ kind, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-md p-8 text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-12 w-12 rounded-xl bg-chart-5/10 border border-chart-5/20 flex items-center justify-center mx-auto">
          <Lock className="h-5 w-5 text-chart-5" />
        </div>
        <h3 className="font-heading font-bold text-xl">
          Your free {kind} vault is full
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You've used all {FREE_VAULT_CAP} free {kind} slots. Everything you've added stays yours —
          unlock unlimited {kind === "song" ? "songs" : "beats"} plus the full toolkit with Artist
          Pro, free for 7 days.
        </p>
        <Link to="/pricing" onClick={onClose}>
          <Button className="w-full font-semibold gap-2">
            <Sparkles className="h-4 w-4" /> Unlock Unlimited — 7 Days Free
          </Button>
        </Link>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Not now
        </button>
      </div>
    </div>
  );
}