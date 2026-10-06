import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Radar, Loader2, Sparkles, ChevronRight } from "lucide-react";

/**
 * On-demand Sam scouting for producers on the AI Manager tier — Sam hits
 * the web for sync calls, A&R calls, and labels seeking beats right now,
 * and queues drafts to Sam's Desk.
 */
export default function MayaScoutCard() {
  const [scouting, setScouting] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const scout = async () => {
    if (scouting) return;
    setScouting(true);
    setError("");
    setResult("");
    try {
      const res = await base44.functions.invoke("mayaScoutBeats", {});
      const found = res.data?.found ?? 0;
      setResult(
        found > 0
          ? `Sam found ${found} opportunit${found === 1 ? "y" : "ies"} and queued ${found === 1 ? "it" : "them"} to your Desk for approval.`
          : "Sam couldn't find any open opportunities this time — they'll look again on their weekly run."
      );
    } catch (e) {
      setError(e?.response?.data?.error || "Sam couldn't run the scout right now.");
    } finally {
      setScouting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-primary/20 p-5 space-y-3">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Radar className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-heading font-semibold">Sam Scouting</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Have Sam search the web right now for sync calls, A&R submissions, and labels openly seeking beats —
              they draft the pitches for your approval.
            </p>
          </div>
        </div>
        <Button size="sm" className="gap-2 font-semibold shrink-0" onClick={scout} disabled={scouting}>
          {scouting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {scouting ? "Sam is scouting…" : "Scout for me"}
        </Button>
      </div>
      {result && (
        <Link to="/maya-desk" className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
          {result} <ChevronRight className="h-3 w-3" />
        </Link>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}