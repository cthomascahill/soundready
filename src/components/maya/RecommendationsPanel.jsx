import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";
import RecommendationCard from "./RecommendationCard";

/**
 * Sam's proactive game plan: recommendations across career opportunities and
 * day-to-day management, each with its reasoning and an approve/dismiss gate.
 */
export default function RecommendationsPanel({ user, onPendingChange }) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [note, setNote] = useState("");

  const load = () => {
    base44.entities.MayaRecommendation.filter({ user_id: user?.id }, "-created_date", 60)
      .then((list) => {
        setRecs(list);
        onPendingChange?.(list.filter((r) => r.status === "proposed").length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    load();
  }, [user?.id]);

  const generate = async () => {
    setGenerating(true);
    setNote("");
    const res = await base44.functions.invoke("mayaRecommend", {})
      .catch((e) => ({ data: { error: e.message } }));
    setGenerating(false);
    if (res.data?.error) {
      setNote("Sam hit a snag building your plan — try again in a moment.");
      return;
    }
    const found = res.data?.found ?? 0;
    setNote(found > 0
      ? `Sam filed ${found} new recommendation${found === 1 ? "" : "s"} — review them below.`
      : "Sam reviewed everything but has nothing new right now. Tell them your goals in chat to give them more to work with.");
    load();
  };

  const onUpdated = (updated) => {
    setRecs((prev) => {
      const next = prev.map((r) => (r.id === updated.id ? updated : r));
      onPendingChange?.(next.filter((r) => r.status === "proposed").length);
      return next;
    });
  };

  const proposed = recs.filter((r) => r.status === "proposed");
  const done = recs.filter((r) => r.status !== "proposed" && r.status !== "dismissed");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
          Sam's game plan for you — grounded in your numbers, your Tracker, and what you've told them in chat. Nothing happens until you approve it.
        </p>
        <Button onClick={generate} disabled={generating} size="sm" className="gap-2 font-semibold shrink-0">
          {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {generating ? "Sam is thinking…" : "Ask Sam for a plan"}
        </Button>
      </div>

      {note && (
        <p className="text-xs text-muted-foreground bg-secondary/50 border border-border rounded-lg px-3 py-2">{note}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-40 rounded-xl bg-card border border-border animate-pulse" />)}
        </div>
      ) : proposed.length === 0 && done.length === 0 ? (
        <div className="rounded-2xl bg-card border border-dashed border-border p-10 text-center space-y-3">
          <Lightbulb className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="font-semibold">No recommendations yet</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Ask Sam to review your data for a plan, or tell them your goals and constraints in chat — they'll remember and use them here.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {proposed.map((rec) => <RecommendationCard key={rec.id} rec={rec} onUpdated={onUpdated} />)}
          </div>
          {done.length > 0 && (
            <div className="space-y-3 pt-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">In motion — record what happens</p>
              {done.map((rec) => <RecommendationCard key={rec.id} rec={rec} onUpdated={onUpdated} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}