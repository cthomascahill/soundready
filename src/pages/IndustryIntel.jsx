import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Bot } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useMode } from "@/lib/mode";
import IntelFeed from "@/components/intel/IntelFeed";
import FeedCard from "@/components/intel/FeedCard";
import HotOpportunityCard from "@/components/intel/HotOpportunityCard";
import useIntelHighlights from "@/components/intel/useIntelHighlights";
import { INTEL_FEEDS, PRODUCER_FEED } from "@/lib/intelFeeds";

function daysUntil(deadline) {
  if (!deadline) return Infinity;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return Infinity;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

// Opportunities: Sam's personally chosen intel feeds — signings, playlist
// moves, trends, local events, grants, tour routing, and a weekly digest.
export default function IndustryIntel() {
  const { user } = useAuth();
  const { mode } = useMode();
  const feeds = mode === "producer" ? [PRODUCER_FEED, ...INTEL_FEEDS] : INTEL_FEEDS;
  const [activeId, setActiveId] = useState(null); // null = the card grid
  const [genreText, setGenreText] = useState("");
  const [city, setCity] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Pull genre + city from the artist profile so every feed is personalized
  useEffect(() => {
    if (!user?.id) {
      setProfileLoaded(true);
      return;
    }
    base44.entities.ArtistProfile.filter({ created_by_id: user.id }, "-created_date", 1)
      .then((data) => {
        const p = data[0];
        if (p) {
          setGenreText([p.genres?.[0], p.subgenre_vibe].filter(Boolean).join(" / "));
          setCity(p.city_state || "");
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoaded(true));
  }, [user]);

  const highlights = useIntelHighlights(feeds, genreText, city, mode, profileLoaded);

  // Sam's one overall pick: the most urgent opportunity across every feed
  const samPick = useMemo(() => {
    const candidates = feeds
      .map((f) => ({ feed: f, hot: highlights[f.id]?.hot }))
      .filter((c) => c.hot);
    if (!candidates.length) return null;
    candidates.sort((a, b) => {
      const da = daysUntil(a.hot.deadline);
      const db = daysUntil(b.hot.deadline);
      const ta = a.hot.action_tip ? 1 : 0;
      const tb = b.hot.action_tip ? 1 : 0;
      return da - db || tb - ta;
    });
    return candidates[0];
  }, [highlights, feeds]);

  const active = feeds.find((f) => f.id === activeId);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {active ? (
          <>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveId(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-full px-3 py-1.5 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All opportunities
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-heading text-2xl font-bold">{active.label}</h2>
              {genreText && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground bg-secondary px-2 py-1 rounded">
                  {genreText}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground -mt-4">{active.description}</p>

            {profileLoaded && (
              <IntelFeed key={`${active.id}-${genreText}-${city}`} feed={active} genres={genreText} city={city} mode={mode} />
            )}
          </>
        ) : (
          <>
            <div>
              <p className="text-xs text-primary uppercase tracking-widest font-medium flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" />
                Sam's picks for you
              </p>
              <h1 className="font-heading text-4xl font-bold">Opportunities</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Hand-picked by Sam for your genre{city ? ` and ${city}` : ""} — tap any card to see everything he found.
              </p>
            </div>

            {profileLoaded && (
              <HotOpportunityCard
                item={samPick?.hot}
                feedLabel={samPick?.feed.label}
                onOpenFeed={() => samPick && setActiveId(samPick.feed.id)}
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {feeds.map((f) => (
                <FeedCard
                  key={f.id}
                  feed={f}
                  highlight={highlights[f.id]?.hot}
                  loading={!profileLoaded || highlights[f.id]?.loading}
                  onOpen={setActiveId}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}