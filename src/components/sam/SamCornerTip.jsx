import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Lightbulb, X } from "lucide-react";
import SamLogo from "@/components/SamLogo";

// Short, verb-first tips SAM holds up on each page. One per navigation,
// rotating while the artist stays put.
const TIPS = [
  "Drop your whole music folder into the Vault — I'll sort every version.",
  "Check your To Do List each morning — I email it too.",
  "Run a Release Plan before your next drop: 6 steps, 2 minutes.",
  "Upload a song and I'll draft playlist pitches automatically.",
  "Connect Spotify so my advice uses your real numbers.",
  "Ask me to research venues before you book anything.",
  "I never send outreach without your approval — you always decide.",
  "Keep your EPK fresh — I attach the latest one to every pitch.",
  "Tell me a goal once and I'll turn it into weekly actions.",
];

const DISMISSED_KEY = "sam-corner-tip-dismissed";

/**
 * SAM in the bottom-left corner of every page, holding up a small card
 * with one rotating tip. The card collapses for the rest of the session
 * when closed; SAM stays.
 */
export default function SamCornerTip() {
  const location = useLocation();
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISSED_KEY) === "1"
  );

  // Fresh tip on every navigation
  useEffect(() => {
    setIdx((prev) => (prev + 1) % TIPS.length);
  }, [location.pathname]);

  // Rotate the tip while the artist stays on one page
  useEffect(() => {
    const timer = setInterval(() => setIdx((prev) => (prev + 1) % TIPS.length), 12000);
    return () => clearInterval(timer);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISSED_KEY, "1"); } catch { /* private mode */ }
  };

  return (
    <div className="fixed bottom-4 left-4 lg:left-64 z-30 flex items-end gap-2 pointer-events-none select-none">
      {/* Tip card SAM holds up */}
      {!dismissed && (
        <div className="pointer-events-auto hidden sm:flex flex-col gap-1.5 rounded-2xl border border-primary/25 bg-card px-3.5 py-3 max-w-[240px] shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">SAM's tip</span>
            <button
              onClick={dismiss}
              aria-label="Hide Sam's tip"
              className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p key={idx} className="text-xs text-foreground leading-snug animate-in fade-in duration-300">
            {TIPS[idx]}
          </p>
          <Link to="/tell-sam" className="text-[10px] font-semibold text-primary hover:underline w-fit">
            Tell Sam →
          </Link>
        </div>
      )}

      {/* SAM himself, peeking up from the corner */}
      <div className="pointer-events-auto shrink-0 drop-shadow-lg group" title="Sam">
        <SamLogo className="h-14 w-14 sm:h-16 sm:w-16 transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:rotate-2" />
      </div>
    </div>
  );
}