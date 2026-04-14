import { Scissors } from "lucide-react";
import ReportSection from "../ReportSection";

const ACCENT_COLORS = [
  "border-primary/30 bg-primary/5 text-primary",
  "border-chart-4/30 bg-chart-4/5 text-chart-4",
  "border-chart-5/30 bg-chart-5/5 text-chart-5",
];

export default function BestClipMoments({ data = [] }) {
  return (
    <ReportSection number={2} title="Best Clip Moments" icon={Scissors} color="text-chart-4">
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i} className={`rounded-xl border p-4 ${ACCENT_COLORS[i % 3].split(" ").slice(0, 2).join(" ")}`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${ACCENT_COLORS[i % 3].split(" ")[2]}`}>
              {item.moment}
            </p>
            <p className="text-sm text-foreground/85 leading-relaxed">{item.why}</p>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}