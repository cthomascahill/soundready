import { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const ModeContext = createContext({ mode: "artist", setMode: () => {} });

/**
 * Dual profile: every account has an Artist side and a Producer side.
 * The active mode re-skins the workspace (Music section, dashboard, tools)
 * and persists on the user's profile so it survives logins.
 */
export function ModeProvider({ children }) {
  const { user } = useAuth();
  const [mode, setModeState] = useState("artist");

  // Respect the persisted choice once the user loads
  useEffect(() => {
    if (user?.active_mode === "producer") setModeState("producer");
    if (user?.active_mode === "artist") setModeState("artist");
  }, [user?.active_mode]);

  const setMode = (m) => {
    if (m === mode) return;
    setModeState(m);
    base44.auth.updateMe({ active_mode: m }).catch(() => {});
  };

  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>;
}

export const useMode = () => useContext(ModeContext);