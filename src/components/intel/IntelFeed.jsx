import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import IntelCard from "./IntelCard";

const CACHE_TTL = 12 * 60 * 60 * 1000; // 12h

// Loads and renders one Industry Intel feed, with a local cache per feed
export default function IntelFeed({ feed, genres, city }) {
  const [items, setItems] = useState(null);
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheKey = `soundready_intel_${feed.id}`;

  const load = useCallback(
    async (force = false) => {
      if (!force) {
        try {
          const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
          if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            setItems(cached.items);
            setBriefing(cached.briefing);
            setLoading(false);
            return;
          }
        } catch {}
      }

      setLoading(true);
      setError(null);
      try {
        const res = await base44.functions.invoke("fetchIndustryIntel", {
          feed: feed.id,
          genres,
          city,
        });
        const data = res.data || {};
        const nextItems = data.items || [];
        const nextBriefing = data.briefing || null;
        setItems(nextItems);
        setBriefing(nextBriefing);
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ items: nextItems, briefing: nextBriefing, timestamp: Date.now() })
          );
        } catch {}
      } catch (err) {
        setError(err.message || "Failed to load this feed");
      } finally {
        setLoading(false);
      }
    },
    [feed.id, genres, city, cacheKey]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-card border border-border p-5 space-y-3 animate-pulse">
            <div className="h-4 bg-zinc-800 rounded w-3/4" />
            <div className="h-3 bg-zinc-800 rounded w-full" />
            <div className="h-3 bg-zinc-800 rounded w-5/6" />
            <div className="h-8 bg-zinc-800/50 rounded-xl w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-zinc-400 text-sm">Couldn't load this feed right now — check back soon.</p>
        <p className="text-xs text-zinc-600">{error}</p>
        <Button variant="outline" className="border-zinc-700" onClick={() => load(true)}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {briefing && (
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 flex items-start gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Quick read</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{briefing}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-700 gap-2"
          onClick={() => load(true)}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {items && items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-sm">Nothing in this feed right now — check back tomorrow.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item, i) => (
            <IntelCard key={item.title + i} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}