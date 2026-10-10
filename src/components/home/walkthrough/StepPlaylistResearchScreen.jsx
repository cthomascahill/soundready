import { CheckCircle2, Music2, TrendingUp } from "lucide-react";

const STAGES = [
  "Scanning 1,300+ curated playlists for your sound",
  'Matching "Midnight Drive" — genre, mood and tempo',
  "Finding each curator's real contact route",
];

const PLAYLISTS = [
  { name: "Chill Vibes Daily", followers: "482k followers", match: "Top match" },
  { name: "Late Night Drive", followers: "236k followers", match: "96% fit" },
  { name: "Lo-Fi Landscapes", followers: "118k followers", match: "91% fit" },
];

// A static, product-accurate mock of Sam's playlist matching (playlist walkthrough, step 2)
export default function StepPlaylistResearchScreen() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4 text-left pointer-events-none select-none shadow-xl">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Sam is on it</p>
      <div className="space-y-2">
        {STAGES.map((s) => (
          <div key={s} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-foreground leading-snug">{s}</p>
          </div>
        ))}
      </div>
      <div className="pt-1 border-t border-border/60 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Playlist matches</p>
        {PLAYLISTS.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Music2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">{p.followers}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 shrink-0">
              <TrendingUp className="h-3 w-3" /> {p.match}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}