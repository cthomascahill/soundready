import { AlertCircle } from "lucide-react";
import ReportSection from "../ReportSection";

export default function BottomLine({ text }) {
  return (
    <ReportSection
      icon={AlertCircle}
      title="The Bottom Line"
      subtitle="Your honest assessment"
    >
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-4">
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{text}</p>
        <p className="text-xs text-muted-foreground italic">
          This assessment is based on algorithmic positioning, current market trends, and streaming platform best practices. Use this as a strategic guide for your release.
        </p>
      </div>
    </ReportSection>
  );
}