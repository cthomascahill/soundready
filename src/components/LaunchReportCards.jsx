import { motion } from "framer-motion";
import { TrendingUp, Zap, Video, Rocket, Mic2 } from "lucide-react";

const SECTIONS = [
  {
    key: "algorithm_outlook",
    label: "Algorithm Outlook",
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    key: "strongest_moments",
    label: "Strongest Moments",
    icon: Zap,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
  },
  {
    key: "content_ideas",
    label: "Content Ideas",
    icon: Video,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
  },
  {
    key: "release_recommendations",
    label: "Release Recommendations",
    icon: Rocket,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/20",
  },
  {
    key: "playlist_pitch",
    label: "Playlist Pitch",
    icon: Mic2,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
];

export default function LaunchReportCards({ analysis }) {
  const hasAny = SECTIONS.some((s) => analysis[s.key]);
  if (!hasAny) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Launch Report</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {SECTIONS.map(({ key, label, icon: Icon, color, bg, border }, i) => {
          const content = analysis[key];
          if (!content) return null;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className={`rounded-2xl bg-card border ${border} p-5 ${key === "playlist_pitch" ? "lg:col-span-2" : ""}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <h3 className={`font-heading font-semibold text-sm ${color}`}>{label}</h3>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{content}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}