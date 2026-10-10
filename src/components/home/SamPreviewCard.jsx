import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SamLogo from "@/components/SamLogo";
import { buildSamSuggestions } from "@/components/home/samPreviewInsights";

// Zero-cost rule engine: SAM-style suggestions derived only from the
// public numbers the search already returned. No AI call, no guessing —
// every line references a real stat the artist just saw.

export default function SamPreviewCard({ artist }) {
  // Rotates through the full insight pool per search so repeat lookups
  // always show something new before anything repeats.
  const [offset] = useState(() => {
    try {
      const next = Number(localStorage.getItem("sr_sam_preview_offset") || 0) + 1;
      localStorage.setItem("sr_sam_preview_offset", String(next));
      return next;
    } catch {
      return Math.floor(Math.random() * 30);
    }
  });

  const suggestions = buildSamSuggestions(artist, offset);
  const [visible, ...locked] = suggestions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl bg-secondary/60 border border-primary/25 p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <SamLogo className="h-7 w-7 text-primary shrink-0" />
        <div className="leading-tight">
          <p className="font-heading font-bold text-sm">SAM read your profile</p>
          <p className="text-xs text-muted-foreground">First look at what your digital manager would do for {artist.name}</p>
        </div>
      </div>

      {/* The one free, real insight */}
      <div className="rounded-xl bg-card border border-primary/20 p-4 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground leading-relaxed">{visible}</p>
      </div>

      {/* Blurred locked suggestions */}
      <div className="relative rounded-xl border border-border overflow-hidden">
        <div className="space-y-3 p-4 blur-[5px] select-none pointer-events-none" aria-hidden="true">
          {locked.map((text, i) => (
            <p key={i} className="text-sm text-foreground leading-relaxed">{text}</p>
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/40 backdrop-blur-[2px] px-4 text-center">
          <div className="flex items-center gap-2 text-primary">
            <Lock className="h-4 w-4" />
            <p className="text-sm font-semibold">{locked.length} more moves SAM already sees</p>
          </div>
          <p className="text-xs text-muted-foreground max-w-xs">
            SAM finds these every week and drafts the emails for you. Nothing sends without your approval.
          </p>
          <div className="space-y-1.5">
            <Button asChild size="sm" className="gap-1.5 font-semibold">
              <Link to="/pricing">
                Get your next moves with SAM <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">$59/month founding price · Cancel anytime</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}