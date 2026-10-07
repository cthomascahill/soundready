import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Search, FolderOpen, ArrowLeft } from "lucide-react";
import { buildDocuments, CATEGORY_ORDER } from "@/lib/storageDocuments";
import StorageSection from "@/components/storage/StorageSection";
import StorageTile from "@/components/storage/StorageTile";

export default function Storage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  // null = tile overview; a category id = that section's documents
  const [openCategory, setOpenCategory] = useState(null);

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
      base44.entities.EPK.filter(byMe, "-created_date", 20).catch(() => []),
    ]).then(([
      tasks, drafts, deals, recommendations, activities, scans, memories,
      royalties, invoices, venueContracts, producerContracts, epks,
    ]) => {
      setDocs(buildDocuments({
        tasks, drafts, deals, recommendations, activities, scans, memories,
        royalties, invoices, venueContracts, producerContracts, epks,
      }));
      setLoading(false);
    });
  }, [user]);

  const counts = useMemo(() => {
    const m = {};
    docs.forEach(d => { m[d.category] = (m[d.category] || 0) + 1; });
    return m;
  }, [docs]);

  const searching = query.trim().length > 0;
  const searchResults = useMemo(() => {
    if (!searching) return [];
    const q = query.trim().toLowerCase();
    return docs.filter(d => `${d.title} ${d.subtitle || ""}`.toLowerCase().includes(q));
  }, [docs, query, searching]);

  const categoriesWithDocs = useMemo(
    () => CATEGORY_ORDER.filter(cat => counts[cat] > 0),
    [counts]
  );

  const latestPerCategory = useMemo(() => {
    // docs are sorted newest-first, so the first hit per category is the latest
    const m = {};
    docs.forEach(d => { if (!m[d.category]) m[d.category] = d; });
    return m;
  }, [docs]);

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

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3 animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-muted" />
                <div className="h-3.5 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Search results */}
        {!loading && searching && (
          searchResults.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <FolderOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground text-sm">No documents match that search.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {CATEGORY_ORDER.map(cat => (
                <StorageSection key={cat} category={cat} docs={searchResults.filter(d => d.category === cat)} />
              ))}
            </div>
          )
        )}

        {/* Tile overview */}
        {!loading && !searching && !openCategory && (
          categoriesWithDocs.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <FolderOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground text-sm">
                Nothing stored yet — ask Sam to run a task, or upload a royalty statement, and it'll show up here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoriesWithDocs.map(cat => (
                <StorageTile
                  key={cat}
                  category={cat}
                  count={counts[cat]}
                  latest={latestPerCategory[cat]}
                  onClick={() => setOpenCategory(cat)}
                />
              ))}
            </div>
          )
        )}

        {/* One section's documents */}
        {!loading && !searching && openCategory && (
          <div className="space-y-6">
            <button
              onClick={() => setOpenCategory(null)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors -ml-2"
            >
              <ArrowLeft className="h-4 w-4" /> All Sections
            </button>
            <StorageSection
              category={openCategory}
              docs={docs.filter(d => d.category === openCategory)}
            />
          </div>
        )}
      </div>
    </div>
  );
}