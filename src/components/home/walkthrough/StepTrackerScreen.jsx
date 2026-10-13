import { motion } from "framer-motion";

// Static, non-interactive mock: the song tracker with stage badges. Part of
// the homepage overview video.
const SONGS = [
  { title: "Midnight Drive", stage: "Mixing", tone: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
  { title: "Neon Rain", stage: "Release week", tone: "bg-primary/15 text-primary border-primary/25" },
  { title: "Ghost Town", stage: "Idea", tone: "bg-secondary text-muted-foreground border-border" },
];

export default function StepTrackerScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-4 sm:px-10 py-6">
      <p className="font-heading text-lg sm:text-2xl font-black tracking-tight">
        Track your music, <span className="text-primary">idea to release</span>
      </p>
      <div className="w-full max-w-md space-y-2">
        {SONGS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 sm:p-3.5"
          >
            <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center text-xs font-black text-muted-foreground shrink-0">
              #
            </div>
            <p className="flex-1 text-xs sm:text-sm font-bold truncate">{s.title}</p>
            <span className={`text-[10px] sm:text-xs font-bold border rounded-full px-2 py-0.5 whitespace-nowrap ${s.tone}`}>
              {s.stage}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}