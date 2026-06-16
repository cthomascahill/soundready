import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { RefreshCw, Newspaper, Bookmark, BookmarkCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsCard from "@/components/news/NewsCard";
import DailyBriefing from "@/components/news/DailyBriefing";

const CATEGORIES = [
  "All News",
  "Streaming & DSPs",
  "Distribution",
  "Labels & Deals",
  "Festivals & Tours",
  "Independent Artists",
  "Charts & Sales",
  "Publishing & Sync",
];

const CACHE_KEY = "soundready_news_cache";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

export default function MusicNews() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [briefing, setBriefing] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All News");
  const [activeTab, setActiveTab] = useState("feed"); // "feed" | "saved"
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem("soundready_saved_news") || "[]"); }
    catch { return []; }
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [artistProfile, setArtistProfile] = useState(null);
  const loaderRef = useRef(null);

  // Load artist profile for personalization
  useEffect(() => {
    if (!user?.id) return;
    base44.entities.ArtistProfile.filter({ created_by_id: user.id }, "-created_date", 1)
      .then(data => { if (data[0]) setArtistProfile(data[0]); })
      .catch(() => {});
  }, [user]);

  const fetchNews = useCallback(async (pageNum = 1, forceRefresh = false) => {
    // Check cache on first load
    if (pageNum === 1 && !forceRefresh) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          setArticles(cached.articles);
          setBriefing(cached.briefing);
          setLastUpdated(cached.lastUpdated);
          setLoading(false);
          return;
        }
      } catch {}
    }

    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const res = await base44.functions.invoke("fetchMusicNews", {
        genre: artistProfile?.genres?.[0] || artistProfile?.subgenre_vibe || "",
        distributor: artistProfile?.distributor || "",
        interested_in_sync: artistProfile?.interested_in_sync || "",
        page: pageNum,
      });

      const { articles: newArticles, briefing: newBriefing, totalResults, lastUpdated: lu } = res.data;

      if (pageNum === 1) {
        setArticles(newArticles);
        setBriefing(newBriefing);
        setLastUpdated(lu);
        // Cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            articles: newArticles, briefing: newBriefing, lastUpdated: lu, timestamp: Date.now(),
          }));
        } catch {}
      } else {
        setArticles(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const unique = newArticles.filter(a => !existingIds.has(a.id));
          return [...prev, ...unique];
        });
      }

      setHasMore(newArticles.length === 30 && pageNum * 30 < Math.min(totalResults, 100));
      setPage(pageNum);
    } catch (err) {
      setError(err.message || "Failed to load news");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [artistProfile]);

  useEffect(() => {
    if (user?.id) fetchNews(1);
  }, [user, fetchNews]);

  // Infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
        fetchNews(page + 1);
      }
    }, { threshold: 0.1 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchNews]);

  const toggleSave = (article) => {
    setSaved(prev => {
      const exists = prev.find(a => a.id === article.id);
      const next = exists ? prev.filter(a => a.id !== article.id) : [article, ...prev];
      localStorage.setItem("soundready_saved_news", JSON.stringify(next));
      return next;
    });
  };

  const isSaved = (id) => saved.some(a => a.id === id);

  const filteredArticles = activeCategory === "All News"
    ? articles
    : articles.filter(a => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Daily Feed</p>
            <h1 className="font-heading text-3xl font-bold">SoundReady News</h1>
            {lastUpdated && (
              <p className="text-xs text-zinc-500 mt-0.5">
                Last updated: Today at {new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNews(1, true)}
            disabled={loading}
            className="border-zinc-700 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Tabs: Feed vs Saved */}
        <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-fit">
          <button onClick={() => setActiveTab("feed")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "feed" ? "bg-primary text-black" : "text-zinc-400 hover:text-white"}`}>
            Feed
          </button>
          <button onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "saved" ? "bg-primary text-black" : "text-zinc-400 hover:text-white"}`}>
            <Bookmark className="h-3.5 w-3.5" />
            Saved
            {saved.length > 0 && (
              <span className="text-[10px] bg-primary/20 text-primary rounded-full px-1.5 py-0.5">{saved.length}</span>
            )}
          </button>
        </div>

        {activeTab === "saved" ? (
          <div className="space-y-4">
            {saved.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <BookmarkCheck className="h-10 w-10 text-zinc-700 mx-auto" />
                <p className="text-zinc-500 text-sm">No saved articles yet. Bookmark articles from the feed.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-400">{saved.length} saved articles</p>
                  <button onClick={() => { setSaved([]); localStorage.removeItem("soundready_saved_news"); }}
                    className="text-xs text-zinc-600 hover:text-red-400 transition-colors flex items-center gap-1">
                    <X className="h-3 w-3" /> Clear all
                  </button>
                </div>
                {saved.map(a => (
                  <NewsCard key={a.id} article={a} saved={true} onSave={toggleSave} />
                ))}
              </>
            )}
          </div>
        ) : (
          <>
            {/* AI Briefing */}
            {!loading && <DailyBriefing briefing={briefing} lastUpdated={lastUpdated} />}

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${activeCategory === cat ? "bg-primary text-black border-primary" : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Error state */}
            {error && (
              <div className="text-center py-20 space-y-4">
                <Newspaper className="h-12 w-12 text-zinc-700 mx-auto" />
                <p className="text-zinc-400">Couldn't load today's news — check back soon</p>
                <p className="text-xs text-zinc-600">{error}</p>
                <Button onClick={() => fetchNews(1, true)} variant="outline" className="border-zinc-700">Retry</Button>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse">
                    <div className="w-full aspect-video bg-zinc-800" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-zinc-800 rounded w-1/4" />
                      <div className="h-4 bg-zinc-800 rounded w-3/4" />
                      <div className="h-3 bg-zinc-800 rounded w-full" />
                      <div className="h-3 bg-zinc-800 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Feed */}
            {!loading && !error && (
              <>
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-zinc-500 text-sm">No articles in this category right now.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredArticles.map(article => (
                      <NewsCard key={article.id} article={article} saved={isSaved(article.id)} onSave={toggleSave} />
                    ))}
                  </div>
                )}

                {/* Infinite scroll sentinel */}
                <div ref={loaderRef} className="py-4 flex justify-center">
                  {loadingMore && (
                    <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}