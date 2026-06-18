import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2, AlertCircle, Clock, Link2, RefreshCw,
  Loader2, Shield, BarChart2, Zap, ExternalLink, Info,
  LogOut, Wifi, WifiOff, AlertTriangle
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ── Freshness helpers ─────────────────────────────────────────────────────────
function getFreshness(last_synced) {
  if (!last_synced) return { status: "missing", label: "Never synced", color: "bg-zinc-600", textColor: "text-zinc-400" };
  const ageHours = (Date.now() - new Date(last_synced).getTime()) / (1000 * 60 * 60);
  if (ageHours < 24) return { status: "live", label: "Live", color: "bg-green-500", textColor: "text-green-400" };
  if (ageHours < 48) return { status: "syncing", label: "Syncing soon", color: "bg-yellow-400", textColor: "text-yellow-400" };
  return { status: "stale", label: "Needs refresh", color: "bg-red-500", textColor: "text-red-400" };
}

function FreshnessBadge({ last_synced }) {
  const f = getFreshness(last_synced);
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${f.textColor}`}>
      <span className={`h-2 w-2 rounded-full ${f.color} ${f.status === "live" ? "animate-pulse" : ""}`} />
      {f.label}
      {last_synced && <span className="text-muted-foreground font-normal">· {new Date(last_synced).toLocaleDateString()}</span>}
    </div>
  );
}

// ── Spotify OAuth Card ────────────────────────────────────────────────────────
function SpotifyCard({ conn, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check for OAuth callback code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (!code || !state) return;

    // Clear params from URL
    window.history.replaceState({}, document.title, window.location.pathname);

    setLoading(true);
    setError("");
    let origin = "https://soundready.ai";
    try { origin = window.top.location.origin; } catch (e) { /* cross-origin iframe fallback */ }
    base44.functions.invoke("spotifyOAuth", {
      action: "exchange_code",
      code,
      redirect_uri: origin + "/connect-profiles",
    }).then(res => {
      setLoading(false);
      if (res.data?.error) { setError(res.data.error); return; }
      if (res.data?.data) onUpdated(res.data.data);
    }).catch(e => {
      setLoading(false);
      setError(e.message);
    });
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError("");
    let appUrl = "https://soundready.ai";
    try { appUrl = window.top.location.origin; } catch (e) { /* cross-origin iframe fallback */ }
    const res = await base44.functions.invoke("spotifyOAuth", {
      action: "get_auth_url",
      app_url: appUrl,
    }).catch(e => ({ data: { error: e.message } }));
    setLoading(false);
    if (res.data?.error) { setError(res.data.error); return; }
    if (res.data?.auth_url) {
      try { window.top.location.href = res.data.auth_url; } catch (e) { window.location.href = res.data.auth_url; }
    }
  };

  const handleSync = async () => {
    setLoading(true);
    setError("");
    const res = await base44.functions.invoke("spotifyOAuth", { action: "sync" })
      .catch(e => ({ data: { error: e.message } }));
    setLoading(false);
    if (res.data?.error) {
      setError(res.data.error);
      if (res.data.needs_reconnect) onUpdated(null);
      return;
    }
    if (res.data?.data) onUpdated(res.data.data);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("spotifyOAuth", { action: "disconnect" })
      .catch(e => ({ data: { error: e.message } }));
    setLoading(false);
    if (res.data?.success) onUpdated(null);
    else setError(res.data?.error || "Failed to disconnect");
  };

  const isConnected = conn?.status === "connected" && conn?.connection_type === "oauth";
  const s = conn?.stats || {};

  return (
    <div className="space-y-4">
      {isConnected ? (
        <>
          {/* Connected profile */}
          <div className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-border p-3">
            {conn.profile_image_url && (
              <img src={conn.profile_image_url} alt="Spotify profile" className="h-10 w-10 rounded-full object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{conn.display_name}</p>
              <FreshnessBadge last_synced={conn.last_synced} />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Followers" value={(s.followers || 0).toLocaleString()} />
            <Stat label="Monthly Listeners" value={s.monthly_listeners ? s.monthly_listeners.toLocaleString() : "—"} />
            {s.popularity !== undefined && <Stat label="Popularity" value={`${s.popularity}/100`} />}
          </div>

          {/* Top tracks */}
          {s.top_tracks?.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Top Tracks</p>
              {s.top_tracks.slice(0, 5).map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-0.5">
                  <span className="truncate text-muted-foreground">{i + 1}. {t.title}</span>
                  {t.popularity && <span className="text-primary/70 shrink-0 ml-2">{t.popularity}/100</span>}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSync} disabled={loading} className="flex-1 gap-1.5">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Sync Now
            </Button>
            <Button size="sm" variant="outline" onClick={handleDisconnect} disabled={loading}
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
              <LogOut className="h-3.5 w-3.5" /> Disconnect
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Connect your Spotify account to automatically pull followers, top tracks, and more.</p>
          <Button onClick={handleConnect} disabled={loading} className="gap-2 bg-[#1DB954] hover:bg-[#1aa34a] text-black font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-lg leading-none">♪</span>}
            {loading ? "Connecting..." : "Connect Spotify"}
          </Button>
          <p className="text-xs text-muted-foreground">You'll be redirected to Spotify to approve access. Scopes: read profile, read email, read follows.</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
          {error.includes("reconnect") && (
            <Button size="sm" onClick={handleConnect} disabled={loading} className="ml-auto h-6 text-xs px-2">Reconnect</Button>
          )}
        </div>
      )}
    </div>
  );
}

// ── YouTube Card ──────────────────────────────────────────────────────────────
function YouTubeCard({ conn, onUpdated }) {
  const [urlInput, setUrlInput] = useState(conn?.profile_url || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    if (!urlInput.trim()) return;
    setLoading(true);
    setError("");
    const res = await base44.functions.invoke("syncPlatformData", {
      platform: "youtube",
      profile_url: urlInput.trim(),
    }).catch(e => ({ data: { error: e.message } }));
    setLoading(false);
    if (res.data?.error) { setError(res.data.error); return; }
    onUpdated(res.data?.data);
  };

  const handleSync = async () => {
    setLoading(true);
    setError("");
    const res = await base44.functions.invoke("syncPlatformData", { platform: "youtube_refresh" })
      .catch(e => ({ data: { error: e.message } }));
    setLoading(false);
    if (res.data?.error) { setError(res.data.error); return; }
    onUpdated(res.data?.data);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("syncPlatformData", { platform: "youtube_disconnect" })
      .catch(e => ({ data: { error: e.message } }));
    setLoading(false);
    if (res.data?.success) onUpdated(null);
    else setError(res.data?.error || "Failed to disconnect");
  };

  const isConnected = conn?.status === "connected" && conn?.raw_channel_id;
  const s = conn?.stats || {};

  return (
    <div className="space-y-4">
      {isConnected ? (
        <>
          <div className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-border p-3">
            {conn.profile_image_url && (
              <img src={conn.profile_image_url} alt="YouTube channel" className="h-10 w-10 rounded-full object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{conn.display_name}</p>
              <FreshnessBadge last_synced={conn.last_synced} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Stat label="Subscribers" value={(s.subscribers || 0).toLocaleString()} />
            <Stat label="Total Views" value={(s.total_views || 0).toLocaleString()} />
            {s.video_count && <Stat label="Videos" value={s.video_count.toLocaleString()} />}
          </div>

          {s.top_tracks?.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Top Videos</p>
              {s.top_tracks.slice(0, 5).map((v, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-0.5 gap-2">
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="truncate text-muted-foreground hover:text-foreground transition-colors">
                    {i + 1}. {v.title}
                  </a>
                  <span className="text-primary/70 shrink-0">{(v.views || 0).toLocaleString()} views</span>
                </div>
              ))}
            </div>
          )}

          {s.recent_posts?.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Recent Uploads</p>
              {s.recent_posts.slice(0, 3).map((v, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-0.5 gap-2">
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="truncate text-muted-foreground hover:text-foreground transition-colors">
                    {v.title}
                  </a>
                  <span className="text-muted-foreground/60 shrink-0">
                    {v.published_at ? new Date(v.published_at).toLocaleDateString() : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSync} disabled={loading} className="flex-1 gap-1.5">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Sync Now
            </Button>
            <Button size="sm" variant="outline" onClick={handleDisconnect} disabled={loading}
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
              <LogOut className="h-3.5 w-3.5" /> Disconnect
            </Button>
          </div>
        </>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="https://youtube.com/@yourchannel"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            className="text-sm h-9"
          />
          <Button size="sm" onClick={handleConnect} disabled={loading || !urlInput.trim()} className="shrink-0 gap-1.5">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
            Connect
          </Button>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ── Generic Platform Card Shell ───────────────────────────────────────────────
function PlatformCard({ platform, conn, onUpdated }) {
  const isConnected = conn?.status === "connected";
  const freshness = getFreshness(conn?.last_synced);

  const borderColor = isConnected
    ? freshness.status === "live" ? "border-green-500/20"
      : freshness.status === "syncing" ? "border-yellow-500/20"
      : "border-red-500/20"
    : "border-border";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-card p-5 space-y-4 ${borderColor}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl ${platform.bg}`}>
            {platform.emoji}
          </div>
          <div>
            <p className="font-semibold text-sm">{platform.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {platform.id === "spotify" ? "OAuth · Auto-synced daily"
                : platform.id === "youtube" ? "YouTube Data API v3 · Auto-synced daily"
                : "Manual entry"}
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          platform.id === "spotify" ? "bg-primary/10 text-primary border-primary/20"
          : platform.id === "youtube" ? "bg-red-500/10 text-red-400 border-red-500/20"
          : "bg-secondary text-muted-foreground border-border"
        }`}>
          {platform.id === "spotify" ? "OAuth" : platform.id === "youtube" ? "API" : "Manual"}
        </span>
      </div>

      {/* Platform-specific content */}
      {platform.id === "spotify" && <SpotifyCard conn={conn} onUpdated={onUpdated} />}
      {platform.id === "youtube" && <YouTubeCard conn={conn} onUpdated={onUpdated} />}
      {(platform.id === "tiktok" || platform.id === "apple_music") && (
        <ManualForm platform={platform} conn={conn} onUpdated={onUpdated} />
      )}
    </motion.div>
  );
}

// ── Manual form for TikTok / Apple Music ─────────────────────────────────────
function ManualForm({ platform, conn, onUpdated }) {
  const existing = conn?.stats || {};
  const [form, setForm] = useState({ ...existing });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("syncPlatformData", {
      platform: "manual",
      sub_platform: platform.id,
      manual_stats: form,
      display_name: form.display_name,
    }).catch(e => ({ data: { error: e.message } }));
    setLoading(false);
    if (res.data?.data) onUpdated(res.data.data);
  };

  if (platform.id === "tiktok") return (
    <div className="space-y-3">
      {conn && (
        <div className="rounded-xl bg-secondary/40 border border-border p-3 grid grid-cols-2 gap-2">
          <Stat label="Followers" value={(existing.followers || 0).toLocaleString()} />
          <Stat label="Total Likes" value={(existing.total_likes || 0).toLocaleString()} />
          {conn.last_synced && <p className="col-span-2"><FreshnessBadge last_synced={conn.last_synced} /></p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Handle" value={form.tiktok_handle || ""} onChange={v => set("tiktok_handle", v)} placeholder="@handle" />
        <Field label="Followers" value={form.followers || ""} onChange={v => set("followers", Number(v))} placeholder="12000" type="number" />
        <Field label="Total Likes" value={form.total_likes || ""} onChange={v => set("total_likes", Number(v))} placeholder="50000" type="number" />
        <Field label="Avg Views/Video" value={form.avg_views_per_video || ""} onChange={v => set("avg_views_per_video", Number(v))} placeholder="5000" type="number" />
      </div>
      <Button size="sm" onClick={handleSave} disabled={loading} className="gap-2">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save TikTok Stats
      </Button>
    </div>
  );

  if (platform.id === "apple_music") return (
    <div className="space-y-3">
      {conn && (
        <div className="rounded-xl bg-secondary/40 border border-border p-3 grid grid-cols-2 gap-2">
          <Stat label="Monthly Listeners" value={existing.apple_monthly_listeners ? existing.apple_monthly_listeners.toLocaleString() : "—"} />
          <Stat label="Shazams" value={existing.shazam_count ? existing.shazam_count.toLocaleString() : "—"} />
          {conn.last_synced && <p className="col-span-2"><FreshnessBadge last_synced={conn.last_synced} /></p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Field label="Apple Music Profile URL" value={form.apple_music_url || ""} onChange={v => set("apple_music_url", v)} placeholder="https://music.apple.com/..." />
        </div>
        <Field label="Monthly Listeners" value={form.apple_monthly_listeners || ""} onChange={v => set("apple_monthly_listeners", Number(v))} placeholder="5000" type="number" />
        <Field label="Shazam Count" value={form.shazam_count || ""} onChange={v => set("shazam_count", Number(v))} placeholder="1200" type="number" />
      </div>
      <Button size="sm" onClick={handleSave} disabled={loading} className="gap-2">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save Apple Music Stats
      </Button>
    </div>
  );

  return null;
}

// ── Self-Reported Stats Card ──────────────────────────────────────────────────
function SelfReportedCard({ conn, onUpdated }) {
  const existing = conn?.stats || {};
  const [form, setForm] = useState({ ...existing });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("syncPlatformData", {
      platform: "manual",
      sub_platform: "self_reported",
      manual_stats: form,
    }).catch(e => ({ data: { error: e.message } }));
    setLoading(false);
    if (res.data?.data) onUpdated(res.data.data);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">📊</div>
          <div>
            <p className="font-semibold text-sm">Live / Business Stats</p>
            <p className="text-xs text-muted-foreground mt-0.5">Update monthly for best Maya results</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-secondary text-muted-foreground border-border">Manual</span>
      </div>

      {conn && (
        <div className="rounded-xl bg-secondary/40 border border-border p-3 grid grid-cols-2 gap-2">
          <Stat label="Total Shows" value={existing.total_shows || "—"} />
          <Stat label="Email List" value={(existing.email_list_size || 0).toLocaleString()} />
          <Stat label="Merch Revenue" value={existing.merch_revenue_12mo ? `$${existing.merch_revenue_12mo.toLocaleString()}` : "—"} />
          <Stat label="Sync Placements" value={existing.sync_placements || "—"} />
          {conn.last_synced && <p className="col-span-2"><FreshnessBadge last_synced={conn.last_synced} /></p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Total Shows (lifetime)" value={form.total_shows || ""} onChange={v => set("total_shows", Number(v))} placeholder="45" type="number" />
        <Field label="Biggest Venue Capacity" value={form.biggest_venue_capacity || ""} onChange={v => set("biggest_venue_capacity", Number(v))} placeholder="500" type="number" />
        <Field label="Avg Ticket Price ($)" value={form.avg_ticket_price || ""} onChange={v => set("avg_ticket_price", Number(v))} placeholder="20" type="number" />
        <Field label="Avg Tickets Sold/Show" value={form.avg_tickets_sold || ""} onChange={v => set("avg_tickets_sold", Number(v))} placeholder="200" type="number" />
        <Field label="Email List Size" value={form.email_list_size || ""} onChange={v => set("email_list_size", Number(v))} placeholder="2500" type="number" />
        <Field label="Merch Revenue (12mo $)" value={form.merch_revenue_12mo || ""} onChange={v => set("merch_revenue_12mo", Number(v))} placeholder="8000" type="number" />
        <Field label="Press Placements" value={form.press_placements || ""} onChange={v => set("press_placements", Number(v))} placeholder="5" type="number" />
        <Field label="Sync Placements" value={form.sync_placements || ""} onChange={v => set("sync_placements", Number(v))} placeholder="2" type="number" />
      </div>
      <Button size="sm" onClick={handleSave} disabled={loading} className="gap-2 w-full">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save Self-Reported Stats
      </Button>
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

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-8 text-sm" />
    </div>
  );
}

const PLATFORMS = [
  { id: "spotify", name: "Spotify", emoji: "🎵", bg: "bg-green-500/10" },
  { id: "youtube", name: "YouTube", emoji: "▶️", bg: "bg-red-500/10" },
  { id: "tiktok", name: "TikTok", emoji: "🎵", bg: "bg-zinc-800" },
  { id: "apple_music", name: "Apple Music", emoji: "🍎", bg: "bg-pink-500/10" },
];

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

  const handleUpdated = (platform) => (data) => {
    if (!data) {
      setConnections(prev => {
        const next = { ...prev };
        if (next[platform]) next[platform] = { ...next[platform], status: "disconnected", stats: null };
        return next;
      });
    } else {
      setConnections(prev => ({ ...prev, [data.platform || platform]: data }));
    }
  };

  const allPlatforms = [...PLATFORMS, { id: "self_reported" }];
  const connectedCount = Object.values(connections).filter(c => c.status === "connected").length;

  const totalDataPoints = Object.values(connections).reduce((acc, c) => {
    return acc + Object.values(c.stats || {}).filter(v => v !== null && v !== undefined && v !== 0 && v !== "").length;
  }, 0);

  const healthItems = allPlatforms.map(p => {
    const conn = connections[p.id];
    const freshness = conn?.status === "connected" ? getFreshness(conn.last_synced) : null;
    return { name: p.id === "self_reported" ? "Live/Business Stats" : PLATFORMS.find(x => x.id === p.id)?.name || p.id, conn, freshness };
  });

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Maya upgrade banner for non-admin */}
        {user?.role !== "admin" && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Your connected data powers Maya.</span> Upgrade to AI Manager to unlock her.
            </p>
            <Link to="/pricing-account" className="text-xs font-semibold text-primary whitespace-nowrap hover:underline">
              Upgrade →
            </Link>
          </div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">AI Manager Data Layer</p>
          <h1 className="font-heading text-4xl font-bold">Connect Your Profiles</h1>
          <p className="text-muted-foreground text-sm max-w-xl">Give Maya access to your real platform data. Spotify and YouTube sync automatically every 24 hours.</p>
        </motion.div>

        {/* Data summary */}
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Maya has access to <span className="text-primary">{totalDataPoints} data points</span> about your career</p>
            <p className="text-xs text-muted-foreground mt-0.5">Spotify and YouTube sync automatically every 24 hours.</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-primary">{connectedCount}</p>
            <p className="text-xs text-muted-foreground">connected</p>
          </div>
        </div>

        {/* Platform cards */}
        <section className="space-y-4">
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" /> Connected Platforms
          </h2>
          <div className="space-y-4">
            {PLATFORMS.map(p => (
              <PlatformCard key={p.id} platform={p} conn={connections[p.id] || null} onUpdated={handleUpdated(p.id)} />
            ))}
          </div>
        </section>

        {/* Self-Reported */}
        <section className="space-y-4">
          <div>
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" /> Self-Reported Stats
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Data that can't be pulled automatically — update these monthly.</p>
          </div>
          <SelfReportedCard conn={connections["self_reported"] || null} onUpdated={handleUpdated("self_reported")} />
        </section>

        {/* Data Health */}
        <section className="space-y-4">
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Data Health
          </h2>
          <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
            <div className="space-y-2.5">
              {healthItems.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <p className="text-sm">{item.name}</p>
                  <div className="flex items-center gap-2">
                    {item.freshness ? (
                      <FreshnessBadge last_synced={item.conn?.last_synced} />
                    ) : (
                      <><AlertCircle className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Not connected</span></>
                    )}
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