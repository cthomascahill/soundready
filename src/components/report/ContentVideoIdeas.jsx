import { Video } from "lucide-react";
import ReportSection from "../ReportSection";

export default function ContentVideoIdeas({ data = [] }) {
  return (
    <ReportSection number={3} title="Content Video Ideas" icon={Video} color="text-chart-5">
      <div className="space-y-4">
        {data.map((idea, i) => (
          <div key={i} className="flex gap-4 items-start">
            <span className="h-7 w-7 rounded-lg bg-chart-5/10 text-chart-5 text-xs font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-heading font-semibold text-sm">{idea.title}</p>
                <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">{idea.platform}</span>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">{idea.description}</p>
            </div>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}