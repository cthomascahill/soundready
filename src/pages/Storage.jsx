import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Search, FolderOpen } from "lucide-react";
import { buildDocuments, STORAGE_CATEGORIES, CATEGORY_ORDER } from "@/lib/storageDocuments";
import StorageSection from "@/components/storage/StorageSection";

export default function Storage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    if (!user?.id) return;
    const byMe = { created_by_id: user.id };
    const mine = { user_id: user.id };
    Promise.all([
      base44.entities.SamTask.filter(mine, "-created_date", 50).catch(() => []),
      base44.entities.SamTaskDraft.filter(mine, "-created_date", 100).catch(() => []),
      base44.entities.DealOutreach.filter(mine, "-created_date", 50).catch(() => []),
      base44.entities.MayaRecommendation.filter(mine, "-created_date", 50).catch(() => []),
      base44.entities.AIActivity.filter(mine, "-created_date", 50).catch(() => []),
      base44.entities.ReputationScan.filter(mine, "-created_date", 20).catch(() => []),
      base44.entities.MayaMemory.filter(mine, "-created_date", 100).catch(() => []),
      base44.entities.RoyaltyStatement.filter(byMe, "-created_date", 50).catch(() => []),
      base44.entities.Invoice.filter(byMe, "-created_date", 50).catch(() => []),
      base44.entities.VenueContract.filter(byMe, "-created_date", 50).catch(() => []),
      base44.entities.ProducerContract.filter(byMe, "-created_date", 50).catch(() => []),
    ]).then(([
      tasks, drafts, deals, recommendations, activities, scans, memories,
      royalties, invoices, venueContracts, producerContracts,
    ]) => {
      setDocs(buildDocuments({
        tasks, drafts, deals, recommendations, activities, scans, memories,
        royalties, invoices, venueContracts, producerContracts,
      }));
      setLoading(false);
    });
  }, [user]);

  const counts = useMemo(() => {
    const m = {};
    docs.forEach(d => { m[d.category] = (m[d.category] || 0) + 1; });
    return m;
  }, [docs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs.filter(d =>
      (category === "all" || d.category === category) &&
      (!q || `${d.title} ${d.subtitle || ""}`.toLowerCase().includes(q))
    );
  }, [docs, query, category]);

  const sections = category === "all" ? CATEGORY_ORDER : [category];

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-7">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Storage</p>
          <h1 className="font-heading text-4xl font-bold">All Documents</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Every report, draft, scan, contract and number Sam has saved for you — organized in one place.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your documents…"
            className="w-full rounded-xl bg-card border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/40"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategory("all")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${category === "all" ? "bg-primary text-black border-primary font-semibold" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
            All Documents {docs.length > 0 && <span className="opacity-70">{docs.length}</span>}
          </button>
          {STORAGE_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${category === c.id ? "bg-primary text-black border-primary font-semibold" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
              {c.label} {counts[c.id] > 0 && <span className="opacity-70">{counts[c.id]}</span>}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2 animate-pulse">
                <div className="h-3.5 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <FolderOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground text-sm">
              {docs.length === 0
                ? "Nothing stored yet — ask Sam to run a task, or upload a royalty statement, and it'll show up here."
                : "No documents match that search."}
            </p>
          </div>
        )}

        {/* Sections */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-8">
            {sections.map(cat => (
              <StorageSection key={cat} category={cat} docs={filtered.filter(d => d.category === cat)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}