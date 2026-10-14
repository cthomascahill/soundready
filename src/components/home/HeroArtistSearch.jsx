import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, X, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";
import PersonalGrowthChart from "@/components/home/PersonalGrowthChart";
import SamPreviewCard from "@/components/home/SamPreviewCard";
import ArtistSuggestDropdown from "@/components/home/ArtistSuggestDropdown";

const compact = (v) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v);

const SPOTIFY_ARTIST_URL = /open\.spotify\.com\/artist\/[A-Za-z0-9]+/i;

export default function HeroArtistSearch() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const suggestSeq = useRef(0);

  const isSpotifyUrl = SPOTIFY_ARTIST_URL.test(name.trim());
  const ready = name.trim().length >= 2 && !loading;

  // Live dropdown: debounced Spotify search as the visitor types
  useEffect(() => {
    const q = name.trim();
    if (isSpotifyUrl || q.length < 2 || loading || result) {
      setSuggestions([]);
      setSuggestLoading(false);
      return;
    }
    setSuggestLoading(true);
    const seq = ++suggestSeq.current;
    const timer = setTimeout(async () => {
      try {
        const res = await base44.functions.invoke("artistGrowthLookup", { mode: "suggest", query: q });
        if (seq !== suggestSeq.current) return;
        setSuggestions(res?.data?.suggestions || []);
        setSuggestOpen(true);
      } catch {
        if (seq === suggestSeq.current) setSuggestions([]);
      } finally {
        if (seq === suggestSeq.current) setSuggestLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [name, loading, result, isSpotifyUrl]);

  const runLookup = async (payload) => {
    setSuggestOpen(false);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await base44.functions.invoke("artistGrowthLookup", payload);
      const data = res?.data || {};
      if (data.found && data.artist) {
        setResult(data.artist);
      } else {
        setError(t("Couldn't find that artist on Spotify. Try picking from the list or paste your Spotify artist link."));
      }
    } catch {
      setError(t("Something went wrong looking that up. Try again."));
    } finally {
      setLoading(false);
    }
  };

  const search = (e) => {
    e.preventDefault();
    if (!ready) return;
    const q = name.trim();
    runLookup(isSpotifyUrl ? { spotifyUrl: q } : { artistName: q });
  };

  const pickSuggestion = (s) => {
    setName(s.name);
    runLookup({ spotifyUrl: s.spotify_url });
  };

  const reset = () => {
    setResult(null);
    setName("");
    setError("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <form onSubmit={search} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="artist-search-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => suggestions.length > 0 && setSuggestOpen(true)}
            onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
            placeholder={t("Search your artist name or paste your Spotify link")}
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={loading}
          />
          <ArtistSuggestDropdown
            suggestions={suggestions}
            loading={suggestLoading}
            open={suggestOpen}
            onPick={pickSuggestion}
          />
        </div>
        <Button type="submit" size="lg" className="h-12 px-3 sm:px-6 font-heading font-bold shrink-0 text-sm sm:text-base" disabled={!ready}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Analyze My Artist Profile")}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground text-center">{t("Find your Spotify numbers and see your 12-month projection.")}</p>

      {error && !loading && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-primary/30 p-6 sm:p-8 space-y-6 relative shadow-xl shadow-primary/5">
          <button onClick={reset} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" aria-label={t("Close")}>
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            {result.image_url ? (
              <img src={result.image_url} alt={result.name} className="h-14 w-14 rounded-full object-cover border border-border" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="text-left">
              <p className="font-heading font-black text-xl leading-tight">{result.name}</p>
              <p className="text-sm text-muted-foreground">
                {compact(result.monthly_listeners)} {t("monthly listeners on Spotify right now")}
                {result.genre ? ` · ${t(result.genre)}` : ""}
              </p>
            </div>
          </div>

          <PersonalGrowthChart artistName={result.name} monthlyListeners={result.monthly_listeners} />
          <SamPreviewCard artist={result} />
        </motion.div>
      )}
    </div>
  );
}