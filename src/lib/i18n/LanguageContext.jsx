import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { CATALOG } from "./translations";

const LanguageContext = createContext(null);
const STORAGE_KEY = "sr_language";

// Displayed in their native form in the picker
export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
];

/**
 * Whole-app language context. The chosen language persists in local storage
 * for visitors and on the signed-in user's profile so it follows them
 * across devices. Untranslated strings fall back to English.
 */
export function LanguageProvider({ children }) {
  const { user } = useAuth();
  const [lang, setLangState] = useState(() => localStorage.getItem(STORAGE_KEY) || "en");

  // Adopt the language saved on the account when the visitor hasn't picked one here
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const preferred = user?.preferred_language;
    if (preferred && CATALOG[preferred] && (!saved || saved === "en") && preferred !== lang) {
      setLangState(preferred);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.preferred_language]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (code) => {
    if (!CATALOG[code]) return;
    setLangState(code);
    localStorage.setItem(STORAGE_KEY, code);
    if (user?.id) base44.auth.updateMe({ preferred_language: code }).catch(() => {});
  };

  const t = useCallback((key) => CATALOG[lang]?.[key] ?? key, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);