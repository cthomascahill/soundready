import { useState } from "react";
import { Scissors, Copy, Check } from "lucide-react";
import ReportCard, { CardHeader } from "./ReportCard";

const TIMESTAMPS = ["0:03", "0:22", "0:47", "1:14", "1:38", "2:05"];

export default function BestClipMoments({ data = [] }) {
  const [copied, setCopied] = useState(null);

  const copyTs = (i, ts) => {
    navigator.clipboard.writeText(ts);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ReportCard borderColor="border-l-chart-5">
      <CardHeader icon={Scissors} title="Best Clip Moments" iconColor="text-chart-5" badge="Section 2" />
      <div className="space-y-3">
        {data.map((item, i) => {
          const ts = TIMESTAMPS[i] || `0:${String(i * 22).padStart(2, "0")}`;
          return (
            <div key={i} className="rounded-xl border border-chart-5/20 bg-chart-5/5 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-bold font-heading">{ts}</span>
                  <span className="font-heading font-semibold text-sm">{item.moment}</span>
                </div>
                <button onClick={() => copyTs(i, ts)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-chart-5/30 bg-chart-5/10 text-xs text-chart-5 hover:bg-chart-5/20 transition-colors shrink-0">
                  {copied === i ? <><Check className="h-3 w-3" />Copied!</> : <><Copy className="h-3 w-3" />Copy Timestamp</>}
                </button>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">{item.why}</p>
            </div>
          );
        })}
      </div>
    </ReportCard>
  );
}