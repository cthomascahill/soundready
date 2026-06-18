import { Link } from "react-router-dom";
import { Sparkles, Search, Mail, Mic2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MayaUpgradeCard() {
  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 space-y-5">
      {/* Avatar + headline */}
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0 shadow-lg" style={{ boxShadow: "0 0 24px rgba(34,197,94,0.3)" }}>
          <Sparkles className="h-7 w-7 text-black" />
        </div>
        <div className="space-y-1">
          <p className="font-heading font-bold text-lg leading-tight">Meet Maya, your AI music manager</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every artist on the come-up needs a manager in their corner. Maya knows your numbers, searches for your opportunities, and does the outreach work while you focus on the music.
          </p>
        </div>
      </div>

      {/* What she does */}
      <ul className="space-y-2.5">
        {[
          { icon: Search, text: "Searches for gigs and festivals in your city — with real venue names and submission links" },
          { icon: Mail, text: "Drafts personalized playlist pitch emails for your songs targeting real curators" },
          { icon: Mic2, text: "Surfaces press features, collab opportunities, and opening slot gigs" },
          { icon: TrendingUp, text: "Analyzes your full career profile and tells you exactly what to do next, not generic advice" },
        ].map(({ icon: Icon, text }, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
            <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="h-3 w-3 text-primary" />
            </div>
            {text}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link to="/pricing-account">
        <Button className="w-full gap-2 shadow-lg" style={{ boxShadow: "0 0 20px rgba(34,197,94,0.25)" }}>
          <Sparkles className="h-4 w-4" />
          Upgrade to AI Manager
        </Button>
      </Link>

      <p className="text-[10px] text-muted-foreground/60 text-center">
        AI Manager tier · Unlock Maya + all proactive outbound tools
      </p>
    </div>
  );
}