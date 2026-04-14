import { Rocket } from "lucide-react";
import ReportSection from "../ReportSection";

export default function ReleaseRecommendations({ releaseDay, releaseDayReason, plan = [] }) {
  return (
    <ReportSection number={4} title="Release Recommendations" icon={Rocket} color="text-chart-3">
      <div className="space-y-5">
        {/* Ideal release day */}
        <div className="rounded-xl bg-chart-3/5 border border-chart-3/20 p-4">
          <p className="text-xs text-chart-3 uppercase tracking-widest font-semibold mb-1">Ideal Release Window</p>
          <p className="font-heading font-bold text-lg">{releaseDay}</p>
          <p className="text-sm text-muted-foreground mt-1">{releaseDayReason}</p>
        </div>

        {/* 7-day plan */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">7-Day Pre-Release Plan</p>
          <div className="space-y-2">
            {plan.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="h-5 w-5 rounded-full border border-chart-3/40 text-chart-3 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{item.day}</p>
                  <p className="text-sm text-foreground/90">{item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ReportSection>
  );
}