import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";

// One feed as a clickable card on the Opportunities grid, with Sam's
// one-line highlight from that feed.
export default function FeedCard({ feed, highlight, loading, onOpen }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onOpen(feed.id)}
      className="text-left rounded-2xl bg-card border border-border p-5 flex flex-col gap-3 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <feed.icon className="h-4 w-4 text-primary" />
          </div>
          <p className="font-heading font-semibold text-sm leading-tight">{feed.label}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>

      {loading ? (
        <div className="space-y-1.5">
          <div className="h-3 bg-secondary rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-secondary rounded w-2/3 animate-pulse" />
        </div>
      ) : highlight ? (
        <div className="flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/20 p-2.5">
          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary mb-0.5">Sam's pick</p>
            <p className="text-xs text-foreground/90 leading-snug line-clamp-2">{highlight.title}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground leading-relaxed">{feed.description}</p>
      )}
    </motion.button>
  );
}