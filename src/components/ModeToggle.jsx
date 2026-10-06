import { useMode } from "@/lib/mode";
import { useAuth } from "@/lib/AuthContext";
import { Mic2, Disc3 } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

const OPTIONS = [
  { key: "artist", icon: Mic2, label: "Artist" },
  { key: "producer", icon: Disc3, label: "Producer" },
];

/**
 * Artist/Producer switch for dual-role accounts. Accounts that picked a
 * single role (Artist only or Producer only) just see their own side.
 * Persists on the user's profile via ModeProvider.
 */
export default function ModeToggle() {
  const { mode, setMode } = useMode();
  const { t } = useLang();
  const { user } = useAuth();
  const accountType = user?.account_type;
  const options =
    accountType === "artist" ? OPTIONS.filter(o => o.key === "artist")
      : accountType === "producer" ? OPTIONS.filter(o => o.key === "producer")
        : OPTIONS;

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl border border-border bg-secondary/40">
      {options.map((opt) => {
        const active = mode === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => setMode(opt.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <opt.icon className="h-3.5 w-3.5" />
            {t(opt.label)}
          </button>
        );
      })}
    </div>
  );
}