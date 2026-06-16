import { Sparkles } from "lucide-react";

export default function DailyBriefing({ briefing, lastUpdated }) {
  if (!briefing) return null;

  const timeStr = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Morning Briefing</span>
        </div>
        {timeStr && (
          <span className="text-[10px] text-zinc-500">Last updated today at {timeStr}</span>
        )}
      </div>
      <p className="text-sm text-zinc-200 leading-relaxed">{briefing}</p>
    </div>
  );
}