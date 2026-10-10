import { CheckCircle2, Mail, MapPin, Users } from "lucide-react";

const STAGES = [
  "Researching venues in Denver & Boulder",
  "Verifying booking contacts on each venue's own site",
  "Quality check against your requirements",
];

const VENUES = [
  { name: "The Marquee Room", city: "Denver, CO", cap: 250, email: "bookings@marqueeroom.com" },
  { name: "The Foxhole", city: "Boulder, CO", cap: 180, email: "shows@thefoxhole.com" },
  { name: "Basement Stage", city: "Denver, CO", cap: 140, email: "book@basementstage.com" },
];

// A static, product-accurate mock of Sam's verified research (step 2 of the walkthrough)
export default function StepResearchScreen() {
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
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Your requirements</p>
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary/60 border border-border rounded-full px-2 py-0.5">
            <MapPin className="h-3 w-3 text-primary" /> Denver & Boulder
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary/60 border border-border rounded-full px-2 py-0.5">
            <Users className="h-3 w-3 text-primary" /> Under 300 cap
          </span>
        </div>
      </div>
      <div className="pt-1 border-t border-border/60 space-y-2.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Verified shortlist</p>
        {VENUES.map((v) => (
          <div key={v.name} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{v.name}</p>
              <p className="text-[10px] text-muted-foreground">{v.city} · ~{v.cap} cap</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
              <Mail className="h-3 w-3 text-primary" /> {v.email}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}