import { motion } from "framer-motion";
import { Music2, Youtube, Instagram } from "lucide-react";

// Static, non-interactive mock: the Connect Profiles screen. Part of the
// homepage overview video.
const PLATFORMS = [
  { icon: Music2, name: "Spotify", stat: "12,480 monthly listeners", color: "text-primary" },
  { icon: Youtube, name: "YouTube", stat: "3.2K subscribers", color: "text-red-400" },
  { icon: Instagram, name: "Instagram", stat: "8,900 followers", color: "text-pink-400" },
];

export default function StepConnectProfilesScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-4 sm:px-10 py-6">
      <p className="font-heading text-lg sm:text-2xl font-black tracking-tight">
        Connect your <span className="text-primary">profiles</span>
      </p>
      <div className="w-full max-w-md space-y-2">
        {PLATFORMS.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 sm:p-3.5"
          >
            <p.icon className={`h-5 w-5 shrink-0 ${p.color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold">{p.name}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{p.stat}</p>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-primary bg-primary/10 border border-primary/25 rounded-full px-2 py-0.5 whitespace-nowrap">
              Connected
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}