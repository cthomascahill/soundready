import { motion } from "framer-motion";
import { Mic2 } from "lucide-react";

export default function FirstImpression({ text }) {
  if (!text) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-primary/5 border border-primary/20 p-6 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Mic2 className="h-4 w-4 text-primary shrink-0" />
        <p className="text-xs text-primary uppercase tracking-widest font-semibold">First Impression — A&R Notes</p>
      </div>
      <p className="text-foreground leading-relaxed text-[15px]">{text}</p>
    </motion.div>
  );
}