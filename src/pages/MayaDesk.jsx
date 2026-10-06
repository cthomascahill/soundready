import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useMode } from "@/lib/mode";
import { hasAIManager } from "@/lib/tier";
import MayaQueueCard from "@/components/maya/MayaQueueCard";
import RecommendationsPanel from "@/components/maya/RecommendationsPanel";
import MemoryPanel from "@/components/maya/MemoryPanel";
import ScansPanel from "@/components/maya/ScansPanel";
import OutcomeControl from "@/components/maya/OutcomeControl";
import SamLogo from "@/components/SamLogo";
import { Button } from "@/components/ui/button";
import {
  Lock, Zap, Check, X, Mail, Loader2, Inbox, ChevronRight, RefreshCw, UserCog,
} from "lucide-react";

const QUEUE_STATUSES = ["pending", "ready_to_send", "viewed"];
const HISTORY_STATUSES = ["sent", "denied", "complete"];

function HistoryRow({ item, onRecordOutcome }) {
  const sent = item.status === "sent";
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${sent ? "bg-primary/10" : "bg-secondary"}`}>
        {sent ? <Mail className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-tight">{item.title}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
            sent ? "bg-primary/10 text-primary border-primary/20" :
            item.status === "denied" ? "bg-red-500/10 text-red-400 border-red-500/20" :
            "bg-secondary text-muted-foreground border-border"
          }`}>
            {sent ? "Sent" : item.status === "denied" ? "Denied" : "Complete"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {sent && item.recipient_email ? `To ${item.recipient_email} · ` : ""}
          {item.metadata?.outcome ? `Outcome: ${item.metadata.outcome.replace(/_/g, " ")} · ` : ""}
          {item.sent_at ? new Date(item.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : new Date(item.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
        {sent && (
          <div className="mt-2">
            <OutcomeControl
              outcome={item.metadata?.outcome}
              note={item.metadata?.outcome_note}
              onRecord={(o, n) => onRecordOutcome(item, o, n)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function MayaDesk() {
  const { user } = useAuth();
  const { mode } = useMode();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("queue");
  const [searching, setSearching] = useState(false);
  const [searchNote, setSearchNote] = useState("");
  const [recsPending, setRecsPending] = useState(0);

  const aiManager = hasAIManager(user);

  // Have Sam run a fresh scouting sweep right now, on demand
  const runSearch = async () => {
    setSearching(true);
    setSearchNote("");
    const fn = mode === "producer" ? "mayaScoutBeats" : "aiTourOpportunities";
    const res = await base44.functions.invoke(fn, {}).catch(e => ({ data: { error: e.message } }));
    setSearching(false);
    if (res.data?.error) {
      setSearchNote(res.data.reason === "no_beats"
        ? "Sam needs at least one beat in your Productions to scout placements."
        : "Sam's search hit a snag — try again in a moment.");
      return;
    }
    const found = res.data?.found ?? res.data?.opportunities_found ?? 0;
    setSearchNote(found > 0
      ? `Sam found ${found} new ${found === 1 ? "opportunity" : "opportunities"} — filed to your queue below.`
      : "Sam searched but found nothing new right now. They also sweep weekly on their own.");
  };

  useEffect(() => {
    if (!aiManager || !user?.id) { setLoading(false); return; }
    base44.entities.AIActivity.filter({ user_id: user.id }, "-created_date", 50)
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [user, aiManager]);

  useEffect(() => {
    if (!aiManager) return;
    const unsub = base44.entities.AIActivity.subscribe((event) => {
      if (event.data?.user_id !== user?.id) return;
      if (event.type === "create") setActivities(prev => [event.data, ...prev]);
      else if (event.type === "update") setActivities(prev => prev.map(a => a.id === event.id ? event.data : a));
    });
    return unsub;
  }, [user, aiManager]);

  const onUpdated = (updated) => {
    setActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  // The artist records what happened after Sam's outreach — Sam factors it into future plans
  const recordOutcome = async (item, outcome, note) => {
    const updated = await base44.entities.AIActivity.update(item.id, {
      metadata: { ...(item.metadata || {}), outcome, outcome_note: note, outcome_at: new Date().toISOString() },
    });
    onUpdated(updated);
  };

  const queue = activities.filter(a => QUEUE_STATUSES.includes(a.status) && a.draft_email);
  const history = activities.filter(a => HISTORY_STATUSES.includes(a.status));

  // ── Non-AI-Manager: upsell ──────────────────────────────────────────────
  if (!aiManager) {
    return (
      <div className="min-h-screen bg-background px-4 py-16">
        <div className="max-w-md mx-auto rounded-2xl border border-primary/20 bg-card p-8 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <p className="font-heading font-bold text-lg">Sam's Desk is part of the AI Manager plan</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sam drafts your playlist pitches, tour outreach, EPKs, beat pitches, and weekly digests — and nothing sends until you approve it here.
          </p>
          <Link to="/pricing-account">
            <Button className="w-full gap-2 font-semibold">
              <Zap className="h-4 w-4" /> Start Manager — $60/mo
            </Button>
          </Link>
          <p className="text-[10px] text-muted-foreground/60">Cancel anytime</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">SAM · SoundReady Artist Manager</p>
          <h1 className="font-heading text-4xl font-bold flex items-center gap-3">
            <SamLogo className="h-8 w-8 text-primary" /> Sam's Desk
          </h1>
          <div className="flex items-start justify-between gap-4">
            <p className="text-muted-foreground text-sm max-w-xl">
              Everything Sam has drafted for you, based on your real connected data. Nothing goes out without your approval — edit any draft before you send it.
            </p>
            <Button onClick={runSearch} disabled={searching} variant="outline" size="sm"
              className="gap-2 font-semibold shrink-0 border-primary/30 text-primary hover:bg-primary/10">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {searching ? "Sam is searching…" : "New search"}
            </Button>
          </div>
          {searchNote && (
            <p className="text-xs text-muted-foreground bg-secondary/50 border border-border rounded-lg px-3 py-2">
              {searchNote}
            </p>
          )}
          <Link to="/maya-profile" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
            <UserCog className="h-3.5 w-3.5" /> Define what matters to you — Sam's profile
          </Link>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1">
          {[
            { key: "queue", label: `Awaiting Approval${queue.length ? ` (${queue.length})` : ""}` },
            { key: "recs", label: `Recommendations${recsPending ? ` (${recsPending})` : ""}` },
            { key: "memory", label: "What Sam Knows" },
            { key: "scans", label: "Reputation Scans" },
            { key: "history", label: `Sent & Denied${history.length ? ` (${history.length})` : ""}` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground border border-transparent"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-card border border-border animate-pulse" />)}
          </div>
        ) : tab === "recs" ? (
          <RecommendationsPanel user={user} mode={mode} onPendingChange={setRecsPending} />
        ) : tab === "memory" ? (
          <MemoryPanel />
        ) : tab === "scans" ? (
          <ScansPanel />
        ) : tab === "queue" ? (
          queue.length === 0 ? (
            <div className="rounded-2xl bg-card border border-dashed border-border p-10 text-center space-y-3">
              <Inbox className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="font-semibold">Nothing waiting on you right now</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Sam files drafts here the moment they find playlist matches, tour openings, or your weekly digest. Upload a song and connect your Spotify to give Sam more to work with.
              </p>
              <Link to="/connect-profiles" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                Connect your platforms <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map(item => (
                <MayaQueueCard key={item.id} item={item} user={user} onUpdated={onUpdated} />
              ))}
            </div>
          )
        ) : (
          history.length === 0 ? (
            <div className="rounded-2xl bg-card border border-dashed border-border p-10 text-center space-y-2">
              <Check className="h-8 w-8 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">No sent or denied items yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(item => <HistoryRow key={item.id} item={item} onRecordOutcome={recordOutcome} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}