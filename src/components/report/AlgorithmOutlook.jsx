import { TrendingUp } from "lucide-react";
import ReportSection from "../ReportSection";

export default function AlgorithmOutlook({ data = [] }) {
  return (
    <ReportSection number={1} title="Algorithm Outlook" icon={TrendingUp} color="text-primary">
      <ul className="space-y-3">
        {data.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="h-5 w-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm text-foreground/90 leading-relaxed">{point}</p>
          </li>
        ))}
      </ul>
    </ReportSection>
  );
}