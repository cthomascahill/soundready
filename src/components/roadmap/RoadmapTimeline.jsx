import { motion } from "framer-motion";
import { ChevronRight, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

// Per-quarter accent palettes, literal Tailwind classes
const ACCENTS = [
  { text: "text-primary", bg: "bg-primary/5", border: "border-primary/30", chip: "bg-primary/15 border-primary/30", dot: "bg-primary", glow: "shadow-primary/50" },
  { text: "text-purple-400", bg: "bg-purple-500/5", border: "border-purple-500/25", chip: "bg-purple-500/15 border-purple-500/25", dot: "bg-purple-500", glow: "shadow-purple-500/50" },
  { text: "text-orange-400", bg: "bg-orange-500/5", border: "border-orange-500/20", chip: "bg-orange-500/15 border-orange-500/20", dot: "bg-orange-500", glow: "shadow-orange-500/50" },
  { text: "text-chart-5", bg: "bg-chart-5/5", border: "border-chart-5/25", chip: "bg-chart-5/15 border-chart-5/25", dot: "bg-chart-5", glow: "shadow-chart-5/50" },
];

const ACTION_LINKS = {
  "song vault": "/history", release: "/history", playlist: "/playlist-pitcher",
  epk: "/pitch-deck", tour: "/tour-planner", venue: "/gig-finder",
  analytics: "/analytics", branding: "/branding-studio",
  royalt: "/royalties",
};

function getLink(text) {
  const lower = text.toLowerCase();
  for (const [kw, path] of Object.entries(ACTION_LINKS)) {
    if (lower.includes(kw)) return path;
  }
  return null;
}

// Vertical journey timeline: glowing spine, numbered moves, milestone chips.
export default function RoadmapTimeline({ quarters }) {
  return (
    <div className="relative">
      {/* The spine */}
      <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-purple-500/50 to-chart-5/60" />

      <div className="space-y-5">
        {(quarters || []).map((q, i) => {
          const a = ACCENTS[i % 4];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12, duration: 0.4 }}
              className="relative pl-9"
            >
              {/* Node */}
              <div className={`absolute left-0 top-9 h-2.5 w-2.5 rounded-full ${a.dot} shadow-[0_0_14px_3px] ${a.glow} ring-4 ring-background`} />

              <div className={`rounded-2xl border ${a.border} ${a.bg} p-6 space-y-4`}>
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${a.text}`}>{q.label}</p>
                </div>
                <h3 className="font-heading text-2xl font-bold -mt-2">{q.theme}</h3>

                <div className="space-y-2.5">
                  {(q.actions || []).map((action, j) => {
                    const link = getLink(action);
                    return (
                      <div key={j} className="flex items-center gap-3 rounded-xl bg-card/60 border border-border/60 px-3 py-2.5">
                        <span className={`h-6 w-6 shrink-0 rounded-full border ${a.chip} ${a.text} text-[11px] font-bold flex items-center justify-center`}>
                          {j + 1}
                        </span>
                        <span className="flex-1 text-sm text-foreground">{action}</span>
                        {link && (
                          <Link to={link} className={`shrink-0 ${a.text} hover:underline text-xs flex items-center gap-0.5 font-semibold`}>
                            Go <ChevronRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.milestone && (
                  <div className={`inline-flex items-center gap-2 rounded-full border ${a.chip} ${a.text} px-3.5 py-1.5 text-xs font-semibold`}>
                    <Trophy className="h-3.5 w-3.5" />
                    {q.milestone}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}