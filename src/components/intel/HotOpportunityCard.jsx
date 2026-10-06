import { motion } from "framer-motion";
import { Flame, Timer, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const SAM_ROBOT_URL =
  "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/d124f0929_generated_f10ed4b3.png";

function daysLabel(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return null;
  const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
  if (days < 0) return "Closed";
  if (days === 0) return "Today";
  return `${days}d left`;
}

// Sam's single top pick across every feed — the robot grabs the card to
// say "check this one out first."
export default function HotOpportunityCard({ item, feedLabel, onOpenFeed }) {
  if (!item) return null;
  const days = daysLabel(item.deadline);
  const sourceUrl = item.source_url && String(item.source_url).startsWith("http") ? item.source_url : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-primary/40 bg-card p-6 pr-16 sm:pr-20 overflow-hidden shadow-xl shadow-primary/10"
    >
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <motion.img
        src={SAM_ROBOT_URL}
        alt="Sam, your AI manager, pointing at his top opportunity pick"
        className="pointer-events-none absolute right-0 top-0 h-24 sm:h-32 w-auto drop-shadow-xl z-10"
        animate={{ y: [0, -6, 0] }}
        transition={{ y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }}
      />

      <div className="relative space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
            <Flame className="h-3 w-3" />
            Sam's Hot Opportunity
          </span>
          {feedLabel && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground bg-secondary border border-border px-2 py-1 rounded-full">
              {feedLabel}
            </span>
          )}
          {days && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-yellow-500/10 text-yellow-400 border-yellow-500/25">
              <Timer className="h-3 w-3" />
              {days}
            </span>
          )}
        </div>

        <h3 className="font-heading font-bold text-xl leading-snug">{item.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{item.summary}</p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button size="sm" className="font-semibold gap-1.5" onClick={onOpenFeed}>
            Check it out
          </Button>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              {item.source_name || "Source"} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}