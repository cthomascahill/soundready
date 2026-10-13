import { motion } from "framer-motion";
import { MapPin, ListMusic, Sparkles } from "lucide-react";

// Static, non-interactive mock: opportunities SAM researched for the artist.
// Part of the homepage overview video.
const OPPS = [
  { icon: MapPin, name: "The Echo · Denver", detail: "350 cap · Good fit for your sound" },
  { icon: ListMusic, name: "Indie Rising playlist", detail: "12K followers · Accepts submissions" },
  { icon: Sparkles, name: "Sync: national ad campaign", detail: "Lo-fi brief · Your catalog fits" },
];

export default function StepOpportunitiesScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-4 sm:px-10 py-6">
      <p className="font-heading text-lg sm:text-2xl font-black tracking-tight">
        Real opportunities, <span className="text-primary">researched by SAM</span>
      </p>
      <div className="w-full max-w-md space-y-2">
        {OPPS.map((o, i) => (
          <motion.div
            key={o.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 sm:p-3.5"
          >
            <o.icon className="h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold truncate">{o.name}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{o.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}