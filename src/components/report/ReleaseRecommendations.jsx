import { Rocket } from "lucide-react";
import ReportCard, { CardHeader } from "./ReportCard";

export default function ReleaseRecommendations({ releaseDay, releaseDayReason, plan = [] }) {
  return (
    <ReportCard borderColor="border-l-orange-500">
      <CardHeader icon={Rocket} title="Release Recommendations" iconColor="text-orange-400" badge="Section 4" />
      <div className="rounded-xl bg-orange-500/5 border border-orange-500/20 p-4 space-y-1">
        <p className="text-xs text-orange-400 uppercase tracking-widest font-bold">Ideal Release Window</p>
        <p className="font-heading font-bold text-xl">{releaseDay}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{releaseDayReason}</p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">7-Day Pre-Release Plan</p>
        <div className="space-y-2">
          {plan.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
              <span className="h-5 w-5 rounded-full border border-orange-500/40 text-orange-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{item.day}</p>
                <p className="text-sm text-foreground/90 leading-relaxed">{item.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ReportCard>
  );
}