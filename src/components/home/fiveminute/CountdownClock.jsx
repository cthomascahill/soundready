import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

// The centerpiece countdown ring. Green arc sweeps as the simulated
// five minutes run down; at 00:00 the timer becomes a green success check.
export default function CountdownClock({ remainingSec, progress, done }) {
  const r = 116;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - (done ? 1 : progress));
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, "0");
  const ss = String(remainingSec % 60).padStart(2, "0");

  return (
    <div className="relative h-72 w-72 sm:h-80 sm:w-80 mx-auto">
      {/* Radiating pulse at 00:00 */}
      {done && (
        <motion.span
          className="absolute inset-6 rounded-full border-2 border-primary pointer-events-none"
          initial={{ scale: 0.85, opacity: 0.8 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <svg viewBox="0 0 260 260" className="h-full w-full -rotate-90">
        <circle cx="130" cy="130" r={r} fill="none" strokeWidth="10" className="stroke-muted/70" />
        <circle
          cx="130"
          cy="130"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: "drop-shadow(0 0 8px hsl(142 71% 45% / 0.55))" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-primary flex items-center justify-center shadow-[0_0_50px_-8px_rgba(74,222,128,0.6)]"
            >
              <Check className="h-12 w-12 sm:h-14 sm:w-14 text-primary-foreground" strokeWidth={3.5} />
            </motion.div>
          ) : (
            <motion.div key="time" exit={{ scale: 0.8, opacity: 0 }} className="text-center">
              <p className="font-heading text-6xl sm:text-7xl font-black tabular-nums leading-none">
                {mm}:{ss}
              </p>
              <p className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                To get started
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}