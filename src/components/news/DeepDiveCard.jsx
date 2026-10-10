import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Lightbulb, ExternalLink, Radar } from "lucide-react";

const CATEGORY_COLORS = {
  "Legal & Policy": "bg-red-500/15 text-red-400 border-red-500/25",
  "Streaming & DSPs": "bg-blue-500/15 text-blue-400 border-blue-500/25",
  "Labels & Deals": "bg-purple-500/15 text-purple-400 border-purple-500/25",
  "AI & Tech": "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  "Publishing & Sync": "bg-pink-500/15 text-pink-400 border-pink-500/25",
  "Industry News": "bg-secondary text-foreground border-border",
};

// Sam's in-depth breakdown of a big ongoing industry story,
// researched across the web (news sites, court filings, YouTube).
export default function DeepDiveCard({ dive }) {
  const [open, setOpen] = useState(false);
  const catColor = CATEGORY_COLORS[dive.category] || CATEGORY_COLORS["Industry News"];

  return (
    <div className="rounded-2xl bg-card border border-primary/25 overflow-hidden">
      {/* Header — always visible */}
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> Sam's Deep Dive
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catColor}`}>
              {dive.category}
            </span>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
        </div>

        <h3 className="font-heading font-bold text-lg leading-snug">{dive.title}</h3>
        {dive.hook && <p className="text-sm text-zinc-400 leading-relaxed">{dive.hook}</p>}
      </button>

      {/* Expanded analysis */}
      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-border pt-4">
          {dive.summary && (
            <div className="text-sm text-zinc-300 leading-relaxed space-y-3 whitespace-pre-line">
              {dive.summary}
            </div>
          )}

          {dive.key_developments?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Radar className="h-3.5 w-3.5" /> Key developments
              </p>
              {dive.key_developments.map((d, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p className="text-sm text-zinc-300 leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          )}

          {dive.why_it_matters && (
            <div className="rounded-xl bg-primary/10 border border-primary/25 p-4 space-y-1.5">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Why this matters to you</p>
              <p className="text-sm text-zinc-200 leading-relaxed">{dive.why_it_matters}</p>
            </div>
          )}

          {dive.artist_takeaway && (
            <div className="flex items-start gap-2.5 rounded-xl bg-muted border border-border p-4">
              <Lightbulb className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-300 leading-relaxed">
                <span className="font-semibold text-white">Your takeaway: </span>{dive.artist_takeaway}
              </p>
            </div>
          )}

          {dive.sources?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dive.sources.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline bg-primary/5 border border-primary/20 rounded-full px-3 py-1.5">
                  {s.title} <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}