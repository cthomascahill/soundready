import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Lock, LayoutGrid, Zap, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { isProOrAbove, hasAIManager } from "@/lib/tier";
import { TOOL_CATEGORIES } from "@/lib/toolCatalog";

// Every tool flattened with its category, then grouped by plan tier
const ALL_TOOLS = TOOL_CATEGORIES.flatMap((cat) =>
  cat.tools.map((t) => ({ ...t, category: cat.label }))
);

const TIERS = [
  {
    id: "free",
    label: "Free",
    badge: "bg-primary/10 text-primary border-primary/25",
    blurb: "Included with every SoundReady account.",
    icon: Zap,
  },
  {
    id: "pro",
    label: "Artist Pro",
    badge: "bg-chart-5/10 text-chart-5 border-chart-5/25",
    blurb: "The full toolkit: touring, pitching, deals and team tools — $39/mo.",
    icon: Zap,
  },
  {
    id: "ai",
    label: "AI Manager",
    badge: "bg-purple-500/15 text-purple-400 border-purple-500/25",
    blurb: "Sam works for you: research, drafts, contracts and outreach — $59/mo for the First 100 Artists.",
    icon: Bot,
  },
];

// One browsable, searchable home for every tool — grouped so it's obvious
// what each plan (Free, Artist Pro, AI Manager) unlocks.
export default function ToolLibrary() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  const unlocked = (tier) =>
    tier === "free" || (tier === "pro" && isProOrAbove(user)) || (tier === "ai" && hasAIManager(user));

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (t) =>
      !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    return TIERS.map((tier) => ({
      ...tier,
      tools: ALL_TOOLS.filter((t) => t.tier === tier.id && match(t)),
    }));
  }, [query]);

  const total = ALL_TOOLS.length;
  const shown = groups.reduce((n, g) => n + g.tools.length, 0);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Everything in one place</p>
            <h1 className="font-heading text-4xl font-bold">Tool Library</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {total} tools for artists — grouped by plan, so you always know what you've unlocked.
            </p>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools..."
              className="pl-10"
            />
          </div>
        </div>

        {shown === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center">
            <LayoutGrid className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No tools match "{query}".</p>
          </div>
        ) : (
          groups
            .filter((tier) => tier.tools.length > 0)
            .map((tier) => (
              <section key={tier.id} className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${tier.badge}`}>
                      <tier.icon className="h-3 w-3" />
                      {tier.label}
                      {!unlocked(tier.id) && <Lock className="h-2.5 w-2.5" />}
                    </span>
                    <p className="text-xs text-muted-foreground hidden sm:block">{tier.blurb}</p>
                  </div>
                  {!unlocked(tier.id) && (
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1.5 shrink-0">
                      <Link to="/pricing-account"><Lock className="h-3 w-3" /> Unlock {tier.label}</Link>
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tier.tools.map((tool) => {
                    const open = unlocked(tool.tier);
                    return (
                      <Link
                        key={tool.name}
                        to={tool.to}
                        className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <tool.icon className="h-4 w-4 text-primary" />
                          </div>
                          {!open && <Lock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-1" />}
                        </div>
                        <p className="font-heading font-semibold mt-3 group-hover:text-primary transition-colors">{tool.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tool.desc}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mt-3">{tool.category}</p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))
        )}
      </div>
    </div>
  );
}