import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

// The always-visible Sound Ready Points total, pinned to the top right.
// Clicking it opens the This Week page (to-dos, earn rates, rewards).
export default function PointsBadge() {
  const [total, setTotal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.PointsEvent.list("-created_date", 500)
      .then((events) => setTotal(events.reduce((sum, e) => sum + (e.points || 0), 0)))
      .catch(() => setTotal(0));

    const onAwarded = (e) => setTotal((t) => (t || 0) + (e.detail?.points || 0));
    window.addEventListener("sr-points-awarded", onAwarded);
    return () => window.removeEventListener("sr-points-awarded", onAwarded);
  }, []);

  return (
    <button
      onClick={() => navigate("/todos")}
      title="Sound Ready Points — what you earn for getting things done"
      className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
    >
      <Zap className="h-4 w-4" />
      {total === null ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <span>{total.toLocaleString()}</span>
      )}
      <span className="hidden xl:inline text-[10px] font-semibold uppercase tracking-wider text-primary/70">
        SR Points
      </span>
    </button>
  );
}