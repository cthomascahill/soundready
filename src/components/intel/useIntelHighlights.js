import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Shares the same localStorage cache as IntelFeed, so warming the grid
// also warms each feed's detail view.
const CACHE_TTL = 12 * 60 * 60 * 1000;
const cacheKey = (id) => `soundready_intel_${id}`;

function readCache(id) {
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey(id)) || "null");
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached;
  } catch {}
  return null;
}

function daysUntil(deadline) {
  if (!deadline) return Infinity;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return Infinity;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

// Sam's pick from one feed: an open-deadline item, preferring urgent ones
// and ones Sam attached an action tip to.
export function pickHot(items) {
  if (!items || !items.length) return null;
  const open = items.filter((it) => daysUntil(it.deadline) >= 0);
  const pool = open.length ? open : items;
  const urgent = pool.filter((it) => daysUntil(it.deadline) <= 30);
  const candidates = urgent.length ? urgent : pool;
  const withTip = candidates.filter((it) => it.action_tip);
  const chosen = withTip.length ? withTip : candidates;
  return chosen[0];
}

// Loads one highlight per feed, cache-first, fetching any feed that isn't
// cached yet. Returns { [feedId]: { hot, loading } }.
export default function useIntelHighlights(feeds, genres, city, mode, ready) {
  const [state, setState] = useState({});

  const feedIds = feeds.map((f) => f.id).join(",");

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const list = feedIds.split(",");

    list.forEach(async (feedId) => {
      const cached = readCache(feedId);
      if (cached) {
        if (!cancelled) {
          setState((s) => ({ ...s, [feedId]: { hot: pickHot(cached.items), loading: false } }));
        }
        return;
      }
      setState((s) => ({ ...s, [feedId]: s[feedId] || { hot: null, loading: true } }));
      try {
        const res = await base44.functions.invoke("fetchIndustryIntel", { feed: feedId, genres, city, mode });
        const data = res.data || {};
        const items = data.items || [];
        try {
          localStorage.setItem(
            cacheKey(feedId),
            JSON.stringify({ items, briefing: data.briefing || null, timestamp: Date.now() })
          );
        } catch {}
        if (!cancelled) {
          setState((s) => ({ ...s, [feedId]: { hot: pickHot(items), loading: false } }));
        }
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, [feedId]: { hot: null, loading: false } }));
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [ready, feedIds, genres, city, mode]);

  return state;
}