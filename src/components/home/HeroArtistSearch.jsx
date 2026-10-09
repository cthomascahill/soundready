import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, X, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";
import PersonalGrowthChart from "@/components/home/PersonalGrowthChart";
import SamPreviewCard from "@/components/home/SamPreviewCard";

const compact = (v) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v);

export default function HeroArtistSearch() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const ready = name.trim().length >= 2 && !loading;

  const search = async (e) => {
    e.preventDefault();
    if (!ready) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await base44.functions.invoke("artistGrowthLookup", { artistName: name.trim() });
      const data = res?.data || {};
      if (data.found && data.artist) {
        setResult(data.artist);
      } else {
        setError(t("Couldn't find that artist on Spotify. Try the exact artist name."));
      }
    } catch {
      setError(t("Something went wrong looking that up. Try again."));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setName("");
    setError("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <form onSubmit={search} className="flex gap-1.5 sm:gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("Search your artist name")}
            className="w-full h-10 sm:h-12 pl-9 sm:pl-11 pr-2 sm:pr-4 rounded-xl bg-card border border-border text-xs sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={loading}
          />
        </div>
        <Button type="submit" size="lg" className="h-10 sm:h-12 px-3 sm:px-6 font-heading font-bold shrink-0 text-xs sm:text-base" disabled={!ready}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Search className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">{t("See my growth")}</span>
            </>
          )}
        </Button>
      </form>
      <p className="text-[10px] sm:text-xs text-muted-foreground text-center">{t("Find your Spotify numbers and see your 12-month projection.")}</p>

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