import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

/**
 * Global language picker — English, Español, Français, Deutsch.
 * The choice applies app-wide and persists immediately.
 */
export default function LanguagePicker({ className = "" }) {
  const { lang, setLang, t, languages } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = languages.find((l) => l.code === lang) || languages[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={t("Language")}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${className}`}
      >
        <Globe className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{current.name}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl border border-border bg-popover shadow-2xl py-1 z-50">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <span>{l.name}</span>
              {l.code === lang && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}