import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Quote } from "lucide-react";

/** Editor for the artist's social proof points: a claim plus where it comes from. */
export default function SocialProofEditor({ value = [], onChange }) {
  const update = (i, key, v) => onChange(value.map((p, idx) => (idx === i ? { ...p, [key]: v } : p)));
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
      <div>
        <p className="font-heading font-semibold">Social proof</p>
        <p className="text-xs text-muted-foreground">Press quotes, milestones, engagement. Anything that shows you're real.</p>
      </div>
      {value.map((p, i) => (
        <div key={i} className="flex gap-2 items-start">
          <Quote className="h-4 w-4 text-primary mt-3 shrink-0" />
          <div className="flex-1 space-y-2">
            <Input
              placeholder='e.g. "One of Denver"s most promising new voices"'
              value={p.text || ""}
              onChange={(e) => update(i, "text", e.target.value)}
            />
            <Input
              placeholder="Source (e.g. Earmilk, Spotify for Artists)"
              value={p.source || ""}
              onChange={(e) => update(i, "source", e.target.value)}
            />
          </div>
          <button
            onClick={() => remove(i)}
            aria-label="Remove proof point"
            className="mt-2 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onChange([...value, { text: "", source: "" }])}>
        <Plus className="h-3.5 w-3.5" /> Add proof point
      </Button>
    </div>
  );
}