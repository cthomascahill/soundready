import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Send, Sparkles, MapPin, Lightbulb, Music2, Mail, Handshake, FileText,
  TrendingUp, Radar, Newspaper, Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import SamLogo from "@/components/SamLogo";

const compact = (v) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v || 0);

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "12px",
};

// One big number on the hero strip
function HeroStat({ icon: Icon, value, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-xl bg-background/40 border border-primary/15 backdrop-blur-sm p-4 text-center"
    >
      <Icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
      <p className="font-heading font-black text-3xl sm:text-4xl text-primary leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1.5">{label}</p>
    </motion.div>
  );
}

// One stat tile on the breakdown grid
function StatTile({ icon: Icon, value, label, color = "text-primary", tint = "bg-primary/10" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border p-4 flex items-start gap-3 hover:border-primary/25 transition-colors">
      <div className={`h-9 w-9 rounded-xl ${tint} flex items-center justify-center shrink-0`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="font-heading font-black text-2xl leading-none">{value}</p>
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

      setStats({
        emailsSent: total(actSent),
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
        awaiting: pick(taskDrafts, "draft") + pick(deals, "draft") + pick(deals, "researched") + pick(recs, "proposed"),
        takenOn: pick(taskDrafts, "approved") + pick(deals, "approved") + pick(recs, "approved") + pick(recs, "executed"),
        dismissed: pick(taskDrafts, "dismissed") + pick(deals, "declined") + pick(recs, "dismissed"),
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

  const workMix = [
    { name: "Playlists", value: s.playlistPitches },
    { name: "Tour openings", value: s.tourOpportunities },
    { name: "Deals", value: s.dealsResearched },
    { name: "Outreach drafts", value: s.outreachDrafts + s.researchDrafts },
    { name: "Advice", value: s.adviceGiven },
    { name: "Recs", value: s.recommendations },
    { name: "Scans", value: s.scans },
  ].filter(d => d.value > 0);

  const pipeline = [
    { name: "Emails sent", value: s.emailsSent, color: "hsl(142 71% 45%)" },
    { name: "Taken on", value: s.takenOn, color: "hsl(200 80% 55%)" },
    { name: "Awaiting your OK", value: s.awaiting, color: "hsl(45 90% 55%)" },
    { name: "Dismissed", value: s.dismissed, color: "hsl(0 0% 45%)" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Hero: Sam's all-time impact */}
      <div className="relative rounded-2xl border border-primary/25 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-16 h-64 w-64 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="relative bg-gradient-to-br from-primary/15 via-secondary/60 to-secondary/40 p-5 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5">
            <SamLogo className="h-7 w-7 text-primary" />
            <div>
              <p className="font-heading font-bold leading-tight">Everything Sam has done for you</p>
              <p className="text-xs text-muted-foreground">All-time tally of research, drafts and outreach</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <HeroStat icon={Send} value={s.emailsSent} label="Emails sent" />
            <HeroStat icon={Sparkles} value={s.playlistPitches + s.tourOpportunities + s.outreachDrafts + s.researchDrafts} label="Pitches drafted" delay={0.05} />
            <HeroStat icon={MapPin} value={s.tourOpportunities} label="Opportunities found" delay={0.1} />
            <HeroStat icon={Lightbulb} value={s.adviceGiven} label="Advice given" delay={0.15} />
          </div>
          {s.creditsUsed > 0 && (
            <p className="text-[11px] text-muted-foreground text-center">
              Powered by {compact(s.creditsUsed)} SAM credits of research and writing.
            </p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl bg-card border border-border p-5 space-y-3">
          <div>
            <p className="font-heading font-bold text-sm">Where Sam's work went</p>
            <p className="text-xs text-muted-foreground">Every deliverable by category</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workMix} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-18} textAnchor="end" height={44} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "hsl(var(--secondary))", opacity: 0.5 }} />
                <Bar dataKey="value" name="Deliverables" fill="hsl(142 71% 45%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-5 space-y-3">
          <div>
            <p className="font-heading font-bold text-sm">The outreach pipeline</p>
            <p className="text-xs text-muted-foreground">Sent, taken on, waiting on you, dismissed</p>
          </div>
          {pipeline.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">Nothing drafted yet.</p>
          ) : (
            <div className="h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Pie data={pipeline} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={3} stroke="none">
                    {pipeline.map(d => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="font-heading font-black text-2xl leading-none text-primary">{s.emailsSent}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">sent</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {pipeline.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                <span className="text-[11px] text-muted-foreground">{d.name} · {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full breakdown grid */}
      <div>
        <p className="text-xs text-primary uppercase tracking-widest font-bold mb-3">The full breakdown</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatTile icon={Music2} value={s.playlistPitches} label={`Playlist pitches drafted${s.playlistPitchesSent ? ` · ${s.playlistPitchesSent} sent` : ""}`} />
          <StatTile icon={MapPin} value={s.tourOpportunities} label={`Tour openings found${s.tourPitchesSent ? ` · ${s.tourPitchesSent} pitched` : ""}`} />
          <StatTile icon={Mail} value={s.emailsSent} label={`Emails sent for you${s.bookingOutreachSent ? ` · ${s.bookingOutreachSent} booking outreach` : ""}`} />
          <StatTile icon={Handshake} value={s.dealsResearched} label={`Deal prospects researched${s.dealPitchesSent ? ` · ${s.dealPitchesSent} pitched` : ""}`} color="text-blue-400" tint="bg-blue-500/10" />
          <StatTile icon={FileText} value={s.outreachDrafts} label={`Venue & label outreach drafts${s.draftsSent ? ` · ${s.draftsSent} sent` : ""}`} color="text-orange-400" tint="bg-orange-500/10" />
          <StatTile icon={TrendingUp} value={s.recommendations} label={`Career recommendations${s.recommendationsApproved ? ` · ${s.recommendationsApproved} taken on` : ""}`} color="text-purple-400" tint="bg-purple-500/10" />
          <StatTile icon={Radar} value={s.scans} label="Reputation scans run" color="text-cyan-400" tint="bg-cyan-500/10" />
          <StatTile icon={Newspaper} value={s.digestsSent} label="Weekly digests delivered" color="text-yellow-400" tint="bg-yellow-500/10" />
          <StatTile icon={FileText} value={s.epksGenerated || s.epkCount} label="Press kits generated" color="text-teal-400" tint="bg-teal-500/10" />
        </div>
      </div>
    </div>
  );
}