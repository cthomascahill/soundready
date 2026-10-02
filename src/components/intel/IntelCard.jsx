import { MapPin, Mail, Timer, ExternalLink, Zap } from "lucide-react";

function daysUntil(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

export default function IntelCard({ item }) {
  const days = daysUntil(item.deadline);
  const sourceUrl = item.source_url && String(item.source_url).startsWith("http") ? item.source_url : null;
  const chips = [
    item.location && { icon: MapPin, text: item.location },
    item.contact && { icon: Mail, text: item.contact },
  ].filter(Boolean);

  return (
    <div className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-3 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading font-semibold text-sm leading-snug">{item.title}</h3>
        {days !== null && (
          <span
            className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              days < 0
                ? "bg-red-500/10 text-red-400 border-red-500/25"
                : days <= 7
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/25"
                  : "bg-primary/10 text-primary border-primary/25"
            }`}
          >
            <Timer className="h-3 w-3" />
            {days < 0 ? "Closed" : days === 0 ? "Today" : `${days}d left`}
          </span>
        )}
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed">{item.summary}</p>
      {item.detail && <p className="text-xs text-zinc-500 leading-relaxed">{item.detail}</p>}

      {(chips.length > 0 || (item.tags && item.tags.length > 0)) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((c) => (
            <span
              key={c.text}
              className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-secondary border border-border rounded-full px-2 py-0.5 max-w-[240px] truncate"
            >
              <c.icon className="h-3 w-3 shrink-0" />
              <span className="truncate">{c.text}</span>
            </span>
          ))}
          {(item.tags || []).slice(0, 3).map((t) => (
            <span key={t} className="text-[10px] text-zinc-500 border border-border rounded-full px-2 py-0.5">
              {t}
            </span>
          ))}
        </div>
      )}

      {item.action_tip && (
        <div className="flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/20 p-3 mt-auto">
          <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-primary/90 leading-relaxed">{item.action_tip}</p>
        </div>
      )}

      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline w-fit"
        >
          {item.source_name || "Source"} <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}