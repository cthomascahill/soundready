import { Video } from "lucide-react";
import ReportCard, { CardHeader } from "./ReportCard";

const PLATFORM_STYLES = {
  TikTok: "bg-red-500/15 text-red-400 border border-red-500/25",
  "Instagram Reels": "bg-purple-500/15 text-purple-400 border border-purple-500/25",
  Instagram: "bg-purple-500/15 text-purple-400 border border-purple-500/25",
  YouTube: "bg-orange-500/15 text-orange-400 border border-orange-500/25",
  Both: "bg-chart-4/15 text-chart-4 border border-chart-4/25",
};

const HIGH_POTENTIAL_INDICES = [0, 2];
const TRENDING_INDICES = [1, 4];

export default function ContentVideoIdeas({ data = [] }) {
  return (
    <ReportCard borderColor="border-l-purple-500">
      <CardHeader icon={Video} title="Content Video Ideas" iconColor="text-purple-400" badge="Section 3" />
      <div className="space-y-3">
        {data.map((idea, i) => {
          const platformStyle = PLATFORM_STYLES[idea.platform] || PLATFORM_STYLES.Both;
          const isHighPotential = HIGH_POTENTIAL_INDICES.includes(i);
          const isTrending = TRENDING_INDICES.includes(i);
          return (
            <div key={i} className="rounded-xl border border-border bg-secondary/20 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${platformStyle}`}>{idea.platform}</span>
                  {isHighPotential && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold border border-primary/20">⚡ High Potential</span>
                  )}
                  {isTrending && !isHighPotential && (
                    <span className="px-2 py-0.5 rounded-full bg-chart-4/15 text-chart-4 text-xs font-bold border border-chart-4/20">🔥 Trending Format</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-medium">#{i + 1}</span>
              </div>
              <p className="font-heading font-semibold text-sm">{idea.title}</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{idea.description}</p>
            </div>
          );
        })}
      </div>
    </ReportCard>
  );
}