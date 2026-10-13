import {
  ListChecks, Music2, DollarSign, Sparkles, Target, MapPin,
} from "lucide-react";

// The opening moves on the Ask Sam welcome screen. Each pairs a familiar
// ask with the tool icon it lands on, so the chat teaches the platform.
const SUGGESTIONS = [
  { icon: ListChecks, label: "Show me my song tracker", hint: "See every release's stage" },
  { icon: Music2, label: "Open my Vault", hint: "Your whole catalog" },
  { icon: DollarSign, label: "What are my royalties looking like?", hint: "What each release earns" },
  { icon: Target, label: "Help me pitch my song to playlists", hint: "Sam drafts it for approval" },
  { icon: Sparkles, label: "What should I focus on this week?", hint: "Sam's read on your next move" },
  { icon: MapPin, label: "Where should I play live next?", hint: "Venues that book artists like you" },
];

export default function SuggestionCards({ onPick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-w-2xl mx-auto">
      {SUGGESTIONS.map((s) => (
        <button
          key={s.label}
          onClick={() => onPick(s.label)}
          className="group text-left p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <s.icon className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground leading-snug">{s.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{s.hint}</p>
        </button>
      ))}
    </div>
  );
}