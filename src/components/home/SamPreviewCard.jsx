import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SamLogo from "@/components/SamLogo";

const compact = (v) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v);

// Zero-cost rule engine: SAM-style suggestions derived only from the
// public numbers the search already returned. No AI call, no guessing —
// every line references a real stat the artist just saw.
function buildSamSuggestions({ name, monthly_listeners, followers, genre }) {
  const listeners = monthly_listeners || 0;
  const ratio = listeners / Math.max(followers, 1);

  const s = [];

  // Listener-to-follower conversion
  if (followers > 0 && ratio >= 1.5) {
    s.push(`${compact(listeners)} people listen each month but only ${compact(followers)} follow you. That gap is your fastest win: turning casual listeners into followers makes the algorithm show your next release to people who already like you.`);
  } else if (followers > 0 && ratio < 0.5 && listeners > 0) {
    s.push(`You have ${compact(followers)} followers but your monthly listeners sit at ${compact(listeners)}. Your core audience is bigger than your reach right now — a release cycle aimed at re-engaging followers is the play.`);
  }

  // Listener tier
  if (listeners > 0 && listeners < 10000) {
    s.push(`At ${compact(listeners)} monthly listeners you're in the discovery stage. Curated independent playlists in ${genre || "your genre"} are still reachable at this size — that door narrows fast as you grow, so pitch now.`);
  } else if (listeners >= 10000 && listeners < 100000) {
    s.push(`Crossing ${compact(listeners)} monthly listeners puts you on playlists' and venues' radar. This is the tier where an opening slot for a touring ${genre || "similar"} act becomes a realistic ask.`);
  } else if (listeners >= 100000 && listeners < 1000000) {
    s.push(`With ${compact(listeners)} monthly listeners you're past the hardest threshold. Labels and sync libraries start reading your numbers as leverage — this is when deal terms matter more than getting any deal.`);
  } else if (listeners >= 1000000) {
    s.push(`At ${compact(listeners)} monthly listeners your problem isn't reach, it's structure: touring routes, release cadence and deal terms are where the money is won or lost at your size.`);
  }

  // Genre angle
  if (genre) {
    s.push(`As a ${genre} artist, your closest comparable acts are already being pitched to the same curators. SAM researches which playlist ecosystems match ${genre} and drafts the outreach for you.`);
  }

  // Always enough cards
  s.push(`SAM reads your real numbers every week and turns them into actions: playlist pitches, venue outreach and label research, each drafted and waiting for your approval.`);
  s.push(`Every opportunity SAM finds for ${name} comes with a ready-to-send email, personalized with your actual stats. Nothing sends without your OK.`);

  return s.slice(0, 4);
}

export default function SamPreviewCard({ artist }) {
  const suggestions = buildSamSuggestions(artist);
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
          <p className="text-xs text-muted-foreground">First look at what your AI manager would do for {artist.name}</p>
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
          <Button asChild size="sm" className="gap-1.5 font-semibold">
            <Link to="/pricing">
              Unlock SAM <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}