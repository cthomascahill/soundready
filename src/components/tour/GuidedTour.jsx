import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { TOUR_STEPS } from "@/lib/tourSteps";

// The new-account guided tour. Each step visits its real page while this
// presenter card explains it. Closing, exiting or finishing all mark the
// tour as seen so it never auto-starts again, it stays replayable from
// the sidebar, and the artist returns to wherever they started.
export default function GuidedTour({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [index, setIndex] = useState(0);
  const [spotRect, setSpotRect] = useState(null);
  const startPathRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    startPathRef.current = location.pathname;
  }, [open]);

  // Visit the step's real page so the artist sees the actual tool
  useEffect(() => {
    if (!open) return;
    const route = TOUR_STEPS[index]?.route;
    if (route && location.pathname !== route) navigate(route);
  }, [open, index]);

  // Spotlight: measure the step's target (the page's main content by
  // default, or the step's own selector) so the tour can dim everything
  // around it and show exactly what the step is talking about.
  useEffect(() => {
    if (!open) return undefined;
    const selector = TOUR_STEPS[index]?.highlight || "main";
    let attempts = 0;
    let timer = null;
    const measure = () => {
      const el = document.querySelector(selector);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      setSpotRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      return true;
    };
    // The step's page may render a beat after the navigation lands
    if (!measure()) {
      timer = setInterval(() => {
        attempts += 1;
        if (measure() || attempts > 20) clearInterval(timer);
      }, 150);
    }
    // Keep the spotlight glued to its target through resizes and scrolls
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      if (timer) clearInterval(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, index, location.pathname]);

  if (!open) return null;

  const step = TOUR_STEPS[index];
  const isLast = index === TOUR_STEPS.length - 1;
  const Icon = step.icon;

  const close = () => {
    // Close right away; saving the "seen" flag happens in the background
    base44.auth.updateMe({ guided_tour_seen: true }).catch(() => {});
    const back = startPathRef.current;
    if (back && back !== location.pathname) navigate(back);
    onClose();
  };

  return (
    <>
      {/* Spotlight: everything outside the target dims to gray so the
          step's subject is the only bright thing on screen */}
      {spotRect && (
        <div aria-hidden className="fixed inset-0 z-[55] pointer-events-none">
          <div
            className="absolute rounded-2xl border-2 border-primary transition-all duration-300"
            style={{
              top: spotRect.top - 8,
              left: spotRect.left - 8,
              width: spotRect.width + 16,
              height: spotRect.height + 16,
              boxShadow: "0 0 0 200vmax rgba(0,0,0,0.72)",
            }}
          />
        </div>
      )}

      <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[min(94vw,760px)]">
      <div className="rounded-2xl border border-primary/25 bg-card shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-primary/80 transition-all duration-300" style={{ width: `${((index + 1) / TOUR_STEPS.length) * 100}%` }} />
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  {index === 0 ? "Welcome" : `Step ${index} of ${TOUR_STEPS.length - 1}`}
                </p>
                <h3 className="font-heading font-bold text-lg sm:text-xl leading-tight truncate">{step.title}</h3>
              </div>
            </div>
            <button onClick={close} aria-label="Exit tour"
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5">
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-base text-muted-foreground leading-relaxed mt-3">{step.body}</p>
          {step.note && (
            <p className="text-sm text-primary/80 mt-2 font-medium">{step.note}</p>
          )}

          <div className="flex items-center justify-between mt-5">
            <button onClick={close} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Exit tour
            </button>
            <div className="flex items-center gap-2.5">
              {index > 0 && (
                <Button variant="outline" onClick={() => setIndex(i => i - 1)} className="gap-1.5">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              )}
              {isLast ? (
                <Button onClick={close} className="gap-1.5">
                  <Check className="h-4 w-4" /> Done
                </Button>
              ) : (
                <Button onClick={() => setIndex(i => i + 1)} className="gap-1.5">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}