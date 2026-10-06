import { Mic2 } from "lucide-react";

// How the user uses SoundReady. Saved to their profile and used to adapt
// the interface (sidebar, dashboard, mode toggle). Artists only.
const TYPES = [
  { key: "artist", icon: Mic2, label: "Artist", desc: "You write, record, and release your own music." },
];

export default function AccountTypePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:max-w-sm">
      {TYPES.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`rounded-xl border p-4 text-left space-y-1.5 transition-all ${
              active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div className="flex items-center gap-2">
              <t.icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <p className="font-heading font-bold text-sm">{t.label}</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
          </button>
        );
      })}
    </div>
  );
}