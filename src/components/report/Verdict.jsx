import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function Verdict({ text }) {
  if (!text) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-foreground text-background p-8 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-background/60 shrink-0" />
        <p className="text-xs text-background/60 uppercase tracking-widest font-semibold">The Verdict</p>
      </div>
      <p className="text-xl font-heading font-semibold leading-relaxed">{text}</p>
    </motion.div>
  );
}