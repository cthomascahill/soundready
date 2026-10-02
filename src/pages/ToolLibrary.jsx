import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Lock, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";
import { isProOrAbove, hasAIManager } from "@/lib/tier";
import { TOOL_CATEGORIES } from "@/lib/toolCatalog";

const TIER_BADGE = {
  free: "bg-primary/10 text-primary border-primary/25",
  pro: "bg-chart-5/10 text-chart-5 border-chart-5/25",
  ai: "bg-purple-500/15 text-purple-400 border-purple-500/25",
};
const TIER_LABEL = { free: "Free", pro: "Pro", ai: "AI Manager" };

// One browsable, searchable home for every tool on the platform
export default function ToolLibrary() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  const unlocked = (tier) =>
    tier === "free" || (tier === "pro" && isProOrAbove(user)) || (tier === "ai" && hasAIManager(user));

  const categories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOL_CATEGORIES.map((cat) => ({
      ...cat,
      tools: cat.tools.filter(
        (t) => !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || cat.label.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.tools.length > 0);
  }, [query]);

  const total = TOOL_CATEGORIES.reduce((n, c) => n + c.tools.length, 0);
  const shown = categories.reduce((n, c) => n + c.tools.length, 0);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Everything in one place</p>
            <h1 className="font-heading text-4xl font-bold">Tool Library</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {total} tools for artists and producers — browse, search, and jump in.
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
          categories.map((cat) => (
            <section key={cat.label} className="space-y-4">
              <h2 className="font-heading text-lg font-semibold">{cat.label}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.tools.map((tool) => {
                  const open = unlocked(tool.tier);
                  return (
                    <Link
                      key={tool.name}
                      to={tool.to}
                      className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <tool.icon className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${TIER_BADGE[tool.tier]}`}>
                          {!open && <Lock className="h-2.5 w-2.5" />}
                          {TIER_LABEL[tool.tier]}
                        </span>
                      </div>
                      <p className="font-heading font-semibold mt-3 group-hover:text-primary transition-colors">{tool.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tool.desc}</p>
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