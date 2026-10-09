import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail, Music2, MapPin, FileText, Newspaper, Handshake, Lightbulb,
  Radar, Sparkles, TrendingUp, Loader2, Send,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import SamLogo from "@/components/SamLogo";

const compact = (v) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v || 0);

// One stat tile on the board
function StatTile({ icon: Icon, value, label, accent = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 flex items-start gap-3 ${accent ? "bg-primary/10 border-primary/25" : "bg-card border-border"}`}
    >
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${accent ? "bg-primary/15" : "bg-secondary"}`}>
        <Icon className={`h-4.5 w-4.5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="min-w-0">
        <p className={`font-heading font-black text-2xl leading-none ${accent ? "text-primary" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-snug">{label}</p>
      </div>
    </motion.div>
  );
}

export default function SamStatsBoard({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = user?.id;
    if (!uid) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      const agg = (entity, opts) => entity.aggregate(opts).then(r => r?.rows || []).catch(() => []);
      const cnt = (entity, query) => entity.count(query).catch(() => 0);

      const [
        actTotals, actSent, taskAgg, taskDrafts, deals, recs,
        scanCount, epkCount, creditsAgg,
      ] = await Promise.all([
        agg(base44.entities.AIActivity, { query: { user_id: uid }, groupBy: "action_type" }),
        agg(base44.entities.AIActivity, { query: { user_id: uid, status: "sent" }, groupBy: "action_type" }),
        agg(base44.entities.SamTask, { query: { user_id: uid }, sum: "drafts_created" }),
        agg(base44.entities.SamTaskDraft, { query: { user_id: uid }, groupBy: "status" }),
        agg(base44.entities.DealOutreach, { query: { user_id: uid }, groupBy: "status" }),
        agg(base44.entities.MayaRecommendation, { query: { user_id: uid }, groupBy: "status" }),
        cnt(base44.entities.ReputationScan, { user_id: uid }),
        cnt(base44.entities.EPK, { user_id: uid }),
        agg(base44.entities.SamUsageEvent, { query: { user_id: uid, status: "settled" }, sum: "units" }),
      ]);
      if (cancelled) return;

      const total = (rows) => rows.reduce((n, r) => n + (r.count || 0), 0);
      const pick = (rows, status) => rows.filter(r => r.status === status).reduce((n, r) => n + (r.count || 0), 0);

      const byType = Object.fromEntries(actTotals.map(r => [r.action_type, r.count || 0]));
      const sentByType = Object.fromEntries(actSent.map(r => [r.action_type, r.count || 0]));
      const emailsSent = total(actSent);

      setStats({
        emailsSent,
        playlistPitches: byType.playlist_pitch || 0,
        playlistPitchesSent: sentByType.playlist_pitch || 0,
        tourOpportunities: byType.tour_opportunity || 0,
        tourPitchesSent: sentByType.tour_opportunity || 0,
        bookingOutreachSent: sentByType.booking_outreach || 0,
        digestsSent: sentByType.digest_sent || 0,
        epksGenerated: byType.epk_generated || 0,
        adviceGiven: total(taskAgg),
        researchDrafts: taskAgg.reduce((n, r) => n + (r.sum_drafts_created || 0), 0),
        outreachDrafts: total(taskDrafts),
        draftsSent: pick(taskDrafts, "sent"),
        dealsResearched: total(deals),
        dealPitchesSent: pick(deals, "sent"),
        recommendations: total(recs),
        recommendationsApproved: pick(recs, "approved") + pick(recs, "executed"),
        scans: scanCount,
        epkCount,
        creditsUsed: creditsAgg.reduce((n, r) => n + (r.sum_units || 0), 0),
      });
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p className="text-sm">Sam is tallying the scoreboard…</p>
      </div>
    );
  }

  const s = stats;
  const isEmpty = s.emailsSent === 0 && s.playlistPitches === 0 && s.tourOpportunities === 0 &&
    s.adviceGiven === 0 && s.recommendations === 0 && s.dealsResearched === 0;

  if (isEmpty) {
    return (
      <div className="rounded-2xl bg-card border border-dashed border-border p-10 text-center space-y-3">
        <SamLogo className="h-10 w-10 text-muted-foreground/40 mx-auto" />
        <p className="font-semibold">The scoreboard fills as Sam works</p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Give Sam a task, run a search, or upload a song — every pitch, scan and piece of advice lands on this board.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Headline strip */}
      <div className="rounded-2xl border border-primary/25 bg-secondary/60 p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2.5">
          <SamLogo className="h-6 w-6 text-primary" />
          <p className="font-heading font-bold">Everything Sam has done for you</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center">
            <p className="font-heading font-black text-3xl text-primary">{s.emailsSent}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5"><Send className="h-3 w-3" /> Emails sent</p>
          </div>
          <div className="text-center">
            <p className="font-heading font-black text-3xl text-primary">{s.playlistPitches + s.tourOpportunities + s.outreachDrafts + s.researchDrafts}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5"><Sparkles className="h-3 w-3" /> Pitches drafted</p>
          </div>
          <div className="text-center">
            <p className="font-heading font-black text-3xl text-primary">{s.tourOpportunities}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> Opportunities found</p>
          </div>
          <div className="text-center">
            <p className="font-heading font-black text-3xl text-primary">{s.adviceGiven}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5"><Lightbulb className="h-3 w-3" /> Advice given</p>
          </div>
        </div>
        {s.creditsUsed > 0 && (
          <p className="text-[11px] text-muted-foreground text-center">
            Powered by {compact(s.creditsUsed)} SAM credits of research and writing.
          </p>
        )}
      </div>

      {/* Full breakdown */}
      <div>
        <p className="text-xs text-primary uppercase tracking-widest font-bold mb-3">The full breakdown</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatTile icon={Music2} accent value={s.playlistPitches} label={`Playlist pitches drafted${s.playlistPitchesSent ? ` · ${s.playlistPitchesSent} sent` : ""}`} />
          <StatTile icon={MapPin} accent={s.tourPitchesSent > 0} value={s.tourOpportunities} label={`Tour openings found${s.tourPitchesSent ? ` · ${s.tourPitchesSent} pitched` : ""}`} />
          <StatTile icon={Mail} accent value={s.emailsSent} label={`Emails sent for you${s.bookingOutreachSent ? ` · ${s.bookingOutreachSent} booking outreach` : ""}`} />
          <StatTile icon={Handshake} value={s.dealsResearched} label={`Deal prospects researched${s.dealPitchesSent ? ` · ${s.dealPitchesSent} pitched` : ""}`} />
          <StatTile icon={FileText} value={s.outreachDrafts} label={`Venue & label outreach drafts${s.draftsSent ? ` · ${s.draftsSent} sent` : ""}`} />
          <StatTile icon={TrendingUp} value={s.recommendations} label={`Career recommendations${s.recommendationsApproved ? ` · ${s.recommendationsApproved} taken on` : ""}`} />
          <StatTile icon={Radar} value={s.scans} label="Reputation scans run" />
          <StatTile icon={Newspaper} value={s.digestsSent} label="Weekly digests delivered" />
          <StatTile icon={FileText} value={s.epksGenerated || s.epkCount} label="Press kits generated" />
        </div>
      </div>
    </div>
  );
}