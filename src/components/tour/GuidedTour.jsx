import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { TOUR_STEPS } from "@/lib/tourSteps";

// The new-account guided tour. Each step visits its real page while this
// presenter card explains it. Closing, exiting or finishing all mark the
// tour as seen so it never auto-starts again — it stays replayable from
// the sidebar, and the artist returns to wherever they started.
export default function GuidedTour({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [index, setIndex] = useState(0);
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

  if (!open) return null;

  const step = TOUR_STEPS[index];
  const isLast = index === TOUR_STEPS.length - 1;
  const Icon = step.icon;

  const close = async () => {
    await base44.auth.updateMe({ guided_tour_seen: true }).catch(() => {});
    const back = startPathRef.current;
    if (back && back !== location.pathname) navigate(back);
    onClose();
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[min(92vw,480px)]">
      <div className="rounded-2xl border border-primary/25 bg-card shadow-2xl overflow-hidden">
        <div className="h-1 bg-primary/80 transition-all duration-300" style={{ width: `${((index + 1) / TOUR_STEPS.length) * 100}%` }} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {index === 0 ? "Welcome" : `Step ${index} of ${TOUR_STEPS.length - 1}`}
                </p>
                <h3 className="font-heading font-bold text-base leading-tight truncate">{step.title}</h3>
              </div>
            </div>
            <button onClick={close} aria-label="Exit tour"
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mt-3">{step.body}</p>
          {step.note && (
            <p className="text-xs text-primary/80 mt-2 font-medium">{step.note}</p>
          )}

          <div className="flex items-center justify-between mt-4">
            <button onClick={close} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Exit tour
            </button>
            <div className="flex items-center gap-2">
              {index > 0 && (
                <Button size="sm" variant="outline" onClick={() => setIndex(i => i - 1)} className="gap-1">
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </Button>
              )}
              {isLast ? (
                <Button size="sm" onClick={close} className="gap-1">
                  <Check className="h-3.5 w-3.5" /> Done
                </Button>
              ) : (
                <Button size="sm" onClick={() => setIndex(i => i + 1)} className="gap-1">
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}