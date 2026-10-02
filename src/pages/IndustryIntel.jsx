import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useMode } from "@/lib/mode";
import IntelFeed from "@/components/intel/IntelFeed";
import { INTEL_FEEDS, PRODUCER_FEED } from "@/lib/intelFeeds";

// Industry Intel: live, personalized feeds — signings, playlist moves, trends,
// local events, grants, tour routing, beat-market calls, and a weekly scene digest.
export default function IndustryIntel() {
  const { user } = useAuth();
  const { mode } = useMode();
  const feeds = mode === "producer" ? [PRODUCER_FEED, ...INTEL_FEEDS] : INTEL_FEEDS;
  const [activeId, setActiveId] = useState(feeds[0].id);
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

  const active = feeds.find((f) => f.id === activeId) || feeds[0];

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Live intelligence</p>
          <h1 className="font-heading text-4xl font-bold">Industry Intel</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Personalized to your genre{city ? ` and ${city}` : ""} — refreshed from around the web.
          </p>
        </div>

        {/* Feed tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {feeds.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveId(f.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                active.id === f.id
                  ? "bg-primary text-black border-primary"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
              }`}
            >
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
            </button>
          ))}
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

        {profileLoaded ? (
          <IntelFeed key={`${active.id}-${genreText}-${city}`} feed={active} genres={genreText} city={city} mode={mode} />
        ) : (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}