import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2, AlertCircle, Clock, Link2, RefreshCw,
  Loader2, Shield, BarChart2, Zap
} from "lucide-react";


function StatusDot({ status }) {
  if (status === "connected") return <span className="h-2 w-2 rounded-full bg-primary inline-block" />;
  if (status === "stale") return <span className="h-2 w-2 rounded-full bg-yellow-400 inline-block" />;
  return <span className="h-2 w-2 rounded-full bg-zinc-600 inline-block" />;
}

function PlatformCard({ platform, conn, onSynced }) {
  const [urlInput, setUrlInput] = useState(conn?.profile_url || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isStale = conn?.last_synced && ((Date.now() - new Date(conn.last_synced).getTime()) > 30 * 24 * 60 * 60 * 1000);
  const status = conn ? (isStale ? "stale" : "connected") : "disconnected";

  const syncUrl = async () => {
    if (!urlInput.trim()) return;
    setLoading(true);
    setError("");
    const res = await base44.functions.invoke("syncPlatformData", {
      platform: platform.id,
      profile_url: urlInput.trim(),
    }).catch(e => ({ data: { error: e.message } }));
    setLoading(false);
    if (res.data?.error) { setError(res.data.error); return; }
    onSynced(res.data?.data);
  };

  const saveManual = async (stats) => {
    setLoading(true);
    setError("");
    const res = await base44.functions.invoke("syncPlatformData", {
      platform: "manual",
      sub_platform: platform.id,
      manual_stats: stats,
    }).catch(e => ({ data: { error: e.message } }));
    setLoading(false);
    if (res.data?.error) { setError(res.data.error); return; }
    onSynced(res.data?.data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-card p-5 space-y-4 ${status === "connected" ? "border-primary/20" : status === "stale" ? "border-yellow-500/20" : "border-border"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl ${platform.bg}`}>
            {platform.emoji}
          </div>
          <div>
            <p className="font-semibold text-sm flex items-center gap-2">
              {platform.name}
              <StatusDot status={status} />
            </p>
            <p className="text-xs text-muted-foreground">
              {status === "connected" ? `Synced ${conn?.last_synced ? new Date(conn.last_synced).toLocaleDateString() : "—"}` :
               status === "stale" ? "Stale — update recommended" : "Not connected"}
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          platform.type === "oauth" ? "bg-primary/10 text-primary border-primary/20" :
          platform.type === "url" ? "bg-chart-5/10 text-chart-5 border-chart-5/20" :
          "bg-secondary text-muted-foreground border-border"
        }`}>
          {platform.type === "oauth" ? "OAuth" : platform.type === "url" ? "Auto" : "Manual"}
        </span>
      </div>

      {/* Connected preview */}
      {conn && conn.stats && (
        <div className="rounded-xl bg-secondary/40 border border-border p-3 grid grid-cols-2 gap-2">
          {platform.id === "youtube" && <>
            <Stat label="Subscribers" value={(conn.stats.subscribers || 0).toLocaleString()} />
            <Stat label="Total Views" value={(conn.stats.total_views || 0).toLocaleString()} />
            {conn.display_name && <p className="col-span-2 text-xs text-muted-foreground">{conn.display_name}</p>}
          </>}
          {platform.id === "spotify" && <>
            <Stat label="Followers" value={(conn.stats.followers || 0).toLocaleString()} />
            <Stat label="Monthly Listeners" value={conn.stats.monthly_listeners ? conn.stats.monthly_listeners.toLocaleString() : "—"} />
            {conn.display_name && <p className="col-span-2 text-xs text-muted-foreground">{conn.display_name}</p>}
            {conn.stats.top_tracks?.length > 0 && (
              <div className="col-span-2 space-y-1">
                <p className="text-[10px] text-muted-foreground">Top Tracks</p>
                {conn.stats.top_tracks.slice(0, 3).map((t, i) => (
                  <p key={i} className="text-xs truncate">· {t.title || t.name}</p>
                ))}
              </div>
            )}
          </>}
          {platform.id === "tiktok" && <>
            <Stat label="Followers" value={(conn.stats.followers || 0).toLocaleString()} />
            <Stat label="Total Likes" value={(conn.stats.total_likes || 0).toLocaleString()} />
          </>}
          {platform.id === "apple_music" && <>
            <Stat label="Monthly Listeners" value={conn.stats.apple_monthly_listeners ? conn.stats.apple_monthly_listeners.toLocaleString() : "—"} />
            <Stat label="Shazams" value={conn.stats.shazam_count ? conn.stats.shazam_count.toLocaleString() : "—"} />
          </>}
          {platform.id === "self_reported" && <>
            <Stat label="Total Shows" value={conn.stats.total_shows || "—"} />
            <Stat label="Email List" value={(conn.stats.email_list_size || 0).toLocaleString()} />
            <Stat label="Merch Revenue" value={conn.stats.merch_revenue_12mo ? `$${conn.stats.merch_revenue_12mo.toLocaleString()}` : "—"} />
            <Stat label="Sync Placements" value={conn.stats.sync_placements || "—"} />
          </>}
        </div>
      )}

      {/* Actions */}
      {platform.type === "url" && (
        <div className="flex gap-2">
          <Input
            placeholder={platform.urlPlaceholder}
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            className="text-sm h-9"
          />
          <Button size="sm" onClick={syncUrl} disabled={loading || !urlInput.trim()} className="shrink-0 gap-1.5">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : conn ? <RefreshCw className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {conn ? "Sync" : "Connect"}
          </Button>
        </div>
      )}

      {platform.type === "manual" && (
        <ManualForm platform={platform} existing={conn?.stats || {}} onSave={saveManual} loading={loading} />
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </motion.div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

function ManualForm({ platform, existing, onSave, loading }) {
  const [form, setForm] = useState(existing);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (platform.id === "tiktok") return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Handle" value={form.tiktok_handle || ""} onChange={v => set("tiktok_handle", v)} placeholder="@handle" />
        <Field label="Followers" value={form.followers || ""} onChange={v => set("followers", Number(v))} placeholder="12000" type="number" />
        <Field label="Total Likes" value={form.total_likes || ""} onChange={v => set("total_likes", Number(v))} placeholder="50000" type="number" />
        <Field label="Avg Views/Video" value={form.avg_views_per_video || ""} onChange={v => set("avg_views_per_video", Number(v))} placeholder="5000" type="number" />
      </div>
      <Field label="Top Video URL" value={form.top_video_url || ""} onChange={v => set("top_video_url", v)} placeholder="https://tiktok.com/@..." />
      <Button size="sm" onClick={() => onSave(form)} disabled={loading} className="gap-2">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save TikTok Stats
      </Button>
    </div>
  );

  if (platform.id === "apple_music") return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Field label="Apple Music Profile URL" value={form.apple_music_url || ""} onChange={v => set("apple_music_url", v)} placeholder="https://music.apple.com/..." />
        </div>
        <Field label="Monthly Listeners (if known)" value={form.apple_monthly_listeners || ""} onChange={v => set("apple_monthly_listeners", Number(v))} placeholder="5000" type="number" />
        <Field label="Shazam Count (if known)" value={form.shazam_count || ""} onChange={v => set("shazam_count", Number(v))} placeholder="1200" type="number" />
      </div>
      <Button size="sm" onClick={() => onSave(form)} disabled={loading} className="gap-2">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save Apple Music Stats
      </Button>
    </div>
  );

  if (platform.id === "self_reported") return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Total Shows (lifetime)" value={form.total_shows || ""} onChange={v => set("total_shows", Number(v))} placeholder="45" type="number" />
        <Field label="Biggest Venue Capacity" value={form.biggest_venue_capacity || ""} onChange={v => set("biggest_venue_capacity", Number(v))} placeholder="500" type="number" />
        <Field label="Avg Ticket Price ($)" value={form.avg_ticket_price || ""} onChange={v => set("avg_ticket_price", Number(v))} placeholder="20" type="number" />
        <Field label="Avg Tickets Sold/Show" value={form.avg_tickets_sold || ""} onChange={v => set("avg_tickets_sold", Number(v))} placeholder="200" type="number" />
        <Field label="Email List Size" value={form.email_list_size || ""} onChange={v => set("email_list_size", Number(v))} placeholder="2500" type="number" />
        <Field label="Merch Revenue (last 12mo $)" value={form.merch_revenue_12mo || ""} onChange={v => set("merch_revenue_12mo", Number(v))} placeholder="8000" type="number" />
        <Field label="Press Placements" value={form.press_placements || ""} onChange={v => set("press_placements", Number(v))} placeholder="5" type="number" />
        <Field label="Sync Placements" value={form.sync_placements || ""} onChange={v => set("sync_placements", Number(v))} placeholder="2" type="number" />
      </div>
      <Button size="sm" onClick={() => onSave(form)} disabled={loading} className="gap-2 w-full">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save Self-Reported Stats
      </Button>
    </div>
  );

  return null;
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-8 text-sm" />
    </div>
  );
}

const PLATFORMS = [
  { id: "spotify", name: "Spotify", emoji: "🎵", bg: "bg-green-500/10", type: "url", urlPlaceholder: "https://open.spotify.com/artist/..." },
  { id: "youtube", name: "YouTube", emoji: "▶️", bg: "bg-red-500/10", type: "url", urlPlaceholder: "https://youtube.com/@yourchannel" },
  { id: "tiktok", name: "TikTok", emoji: "🎵", bg: "bg-zinc-800", type: "manual" },
  { id: "apple_music", name: "Apple Music", emoji: "🍎", bg: "bg-pink-500/10", type: "manual" },
];

const META_PLATFORM = { id: "self_reported", name: "Live / Business Stats", emoji: "📊", bg: "bg-primary/10", type: "manual" };

export default function ConnectProfiles() {
  const { user } = useAuth();
  const [connections, setConnections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.PlatformConnection.filter({ created_by_id: user.id }, "-created_date", 20)
      .then(conns => {
        const map = {};
        conns.forEach(c => { map[c.platform] = c; });
        setConnections(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleSynced = (data) => {
    if (!data) return;
    setConnections(prev => ({ ...prev, [data.platform]: data }));
  };

  const allPlatforms = [...PLATFORMS, META_PLATFORM];
  const connectedCount = Object.keys(connections).length;
  const totalDataPoints = Object.values(connections).reduce((acc, c) => {
    return acc + Object.values(c.stats || {}).filter(v => v !== null && v !== undefined && v !== 0 && v !== "").length;
  }, 0);

  const healthItems = allPlatforms.map(p => {
    const conn = connections[p.id];
    const isStale = conn?.last_synced && ((Date.now() - new Date(conn.last_synced).getTime()) > 30 * 24 * 60 * 60 * 1000);
    return {
      name: p.name,
      status: conn ? (isStale ? "stale" : "connected") : "missing",
    };
  });

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">AI Manager Data Layer</p>
          <h1 className="font-heading text-4xl font-bold">Connect Your Profiles</h1>
          <p className="text-muted-foreground text-sm max-w-xl">Give Maya access to your real platform data. The more you connect, the smarter her advice becomes.</p>
        </motion.div>

        {/* Maya data callout */}
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Maya has access to <span className="text-primary">{totalDataPoints} data points</span> about your career</p>
            <p className="text-xs text-muted-foreground mt-0.5">Connect more platforms to unlock deeper, more specific advice from your AI manager.</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-primary">{connectedCount}</p>
            <p className="text-xs text-muted-foreground">connected</p>
          </div>
        </div>

        {/* Connected Platforms */}
        <section className="space-y-4">
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" /> Connected Platforms
          </h2>
          <div className="space-y-4">
            {PLATFORMS.map(p => (
              <PlatformCard key={p.id} platform={p} conn={connections[p.id] || null} onSynced={handleSynced} />
            ))}
          </div>
        </section>

        {/* Self-Reported Stats */}
        <section className="space-y-4">
          <div>
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" /> Self-Reported Stats
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Data that can't be pulled automatically — update these monthly for best results.</p>
          </div>
          <PlatformCard platform={META_PLATFORM} conn={connections["self_reported"] || null} onSynced={handleSynced} />
        </section>

        {/* Data Health */}
        <section className="space-y-4">
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Data Health
          </h2>
          <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
            <div className="space-y-2">
              {healthItems.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <p className="text-sm">{item.name}</p>
                  <div className="flex items-center gap-2">
                    {item.status === "connected" && <><CheckCircle2 className="h-3.5 w-3.5 text-primary" /><span className="text-xs text-primary font-medium">Connected</span></>}
                    {item.status === "stale" && <><Clock className="h-3.5 w-3.5 text-yellow-400" /><span className="text-xs text-yellow-400 font-medium">Stale (30+ days)</span></>}
                    {item.status === "missing" && <><AlertCircle className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Not connected</span></>}
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-muted-foreground">Profile Completeness</p>
                <p className="text-xs font-bold text-primary">{Math.round((connectedCount / allPlatforms.length) * 100)}%</p>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.round((connectedCount / allPlatforms.length) * 100)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {connectedCount === 0 && "Connect at least Spotify or YouTube to get real data into Maya."}
                {connectedCount > 0 && connectedCount < 3 && "Good start! Connect more platforms for richer AI advice."}
                {connectedCount >= 3 && "🔥 Maya has strong context about your career."}
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}