import { motion } from "framer-motion";
import { ListMusic } from "lucide-react";

// Static, non-interactive mock: the playlist pitcher with match scores.
// Part of the homepage overview video.
const PLAYLISTS = [
  { name: "Late Night Indie", detail: "84% match · 45K followers" },
  { name: "Bedroom Pop Radar", detail: "91% match · 12K followers" },
  { name: "Chill Lo-Fi Gems", detail: "88% match · 30K followers" },
];

export default function StepPlaylistsScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-4 sm:px-10 py-6">
      <p className="font-heading text-lg sm:text-2xl font-black tracking-tight">
        Pitch to playlists that <span className="text-primary">fit your sound</span>
      </p>
      <div className="w-full max-w-md space-y-2">
        {PLAYLISTS.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 sm:p-3.5"
          >
            <ListMusic className="h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold truncate">{p.name}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{p.detail}</p>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-primary bg-primary/10 border border-primary/25 rounded-full px-2 py-0.5 whitespace-nowrap">
              Pitch ready
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}