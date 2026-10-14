import { Loader2, Music2 } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

const compact = (v) =>
  v > 0 ? new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v) : null;

// Live Spotify artist suggestions shown under the hero search box while
// the visitor types. onMouseDown fires before the input's blur hides us.
export default function ArtistSuggestDropdown({ suggestions, loading, open, onPick }) {
  const { t } = useLang();
  if (!open) return null;

  return (
    <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl bg-popover border border-border shadow-2xl overflow-hidden">
      {loading ? (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("Searching Spotify...")}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="px-4 py-3 text-sm text-muted-foreground">
          {t("No artists found. Paste your Spotify artist link instead.")}
        </div>
      ) : (
        <ul className="max-h-72 overflow-y-auto">
          {suggestions.map((s) => (
            <li key={s.spotify_url}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onPick(s);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary transition-colors"
              >
                <Music2 className="h-4 w-4 text-primary shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground truncate">{s.name}</span>
                  <span className="block text-xs text-muted-foreground truncate">
                    {[s.genre, compact(s.monthly_listeners) && `${compact(s.monthly_listeners)} ${t("listeners")}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}