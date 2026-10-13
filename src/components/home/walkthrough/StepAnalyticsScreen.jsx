import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

// Static, non-interactive mock: the analytics dashboard. Part of the
// homepage overview video.
const STATS = [
  { label: "Monthly listeners", value: "12,480", delta: "+18%" },
  { label: "Total streams", value: "1.2M", delta: "+9%" },
  { label: "Followers", value: "8,900", delta: "+12%" },
];
const BARS = [30, 42, 38, 55, 61, 58, 78, 92];

export default function StepAnalyticsScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-4 sm:px-10 py-6">
      <p className="font-heading text-lg sm:text-2xl font-black tracking-tight">
        Your <span className="text-primary">analytics</span>, in one place
      </p>
      <div className="w-full max-w-lg space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className="rounded-xl border border-border bg-card p-2.5 sm:p-3 text-center"
            >
              <p className="text-sm sm:text-base font-black">{s.value}</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">{s.label}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-primary flex items-center justify-center gap-0.5">
                <TrendingUp className="h-2.5 w-2.5" />
                {s.delta}
              </p>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-end justify-center gap-1.5 h-16 sm:h-20 rounded-xl border border-border bg-card p-3"
        >
          {BARS.map((h, i) => (
            <div key={i} className="flex-1 max-w-3 rounded-t bg-primary/80" style={{ height: `${h}%` }} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}