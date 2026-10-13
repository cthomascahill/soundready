import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Link2, BarChart2, Shield, Zap, Loader2, RefreshCw,
  LogOut, AlertCircle, AlertTriangle, ArrowRight, Mic2,
} from "lucide-react";
import AccountTypePicker from "@/components/AccountTypePicker";
import TikTokCard from "@/components/artistprofile/TikTokCard";
import { getFreshness, FreshnessBadge, Stat, Field } from "@/components/artistprofile/platformShared";

// Pull the real reason out of an SDK error; the raw message is a generic
// "Request failed with status code 500" that hides what actually broke.
const friendlyError = (e) =>
  e?.response?.data?.error ||
  e?.data?.error ||
  e?.response?.data?.message ||
  e?.message ||
  "Something went wrong. Please try again.";



// ── Spotify OAuth Card ────────────────────────────────────────────────────────
function SpotifyCard({ conn, onUpdated, oauthLoading, oauthError }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(oauthError || "");

  useEffect(() => { setError(oauthError || ""); }, [oauthError]);

  const handleSync = async () => {
    setLoading(true);
    setError("");
    const res = await base44.functions.invoke("spotifyOAuth", { action: "link_artist", artist_url: conn?.profile_url })
      .catch(e => ({ data: { error: friendlyError(e) } }));
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
      .catch(e => ({ data: { error: friendlyError(e) } }));
    setLoading(false);
    if (res.data?.success) onUpdated(null);
    else setError(res.data?.error || "Failed to disconnect");
  };

  // Artist profile linking — paste the Spotify artist URL to pull artist stats
  const [artistUrl, setArtistUrl] = useState("");

  const linkArtist = async () => {
    if (!artistUrl.trim()) return;
    setLoading(true);
    setError("");
    const res = await base44.functions.invoke("spotifyOAuth", {
      action: "link_artist",
      artist_url: artistUrl.trim(),
    }).catch(e => ({ data: { error: friendlyError(e) } }));
    setLoading(false);
    if (res.data?.error) { setError(res.data.error); return; }
    setArtistUrl("");
    if (res.data?.data) onUpdated(res.data.data);
  };

  const isConnected = conn?.status === "connected" && !!conn?.stats?.artist_id;
  const s = conn?.stats || {};
  const anyLoading = loading || oauthLoading;

  return (
    <div className="space-y-4">
      {isConnected ? (
        <>
          <div className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-border p-3">
            <div className="h-10 w-10 rounded-full bg-[#1DB954]/15 flex items-center justify-center shrink-0">
              <Mic2 className="h-5 w-5 text-[#1DB954]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{s.artist_name}</p>
              <FreshnessBadge last_synced={conn.last_synced} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Stat label="Monthly Listeners" value={s.monthly_listeners ? s.monthly_listeners.toLocaleString() : "—"} />
            {s.total_plays > 0 && <Stat label="Total Streams" value={s.total_plays.toLocaleString()} />}
            {s.artist_followers > 0 && <Stat label="Artist Followers" value={s.artist_followers.toLocaleString()} />}
            {s.popularity > 0 && <Stat label="Popularity" value={`${s.popularity}/100`} />}
          </div>

          <div className="pt-2 border-t border-border space-y-3">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Spotify Artist Profile</p>
            <div className="flex gap-2">
              <Input
                placeholder="https://open.spotify.com/artist/..."
                value={artistUrl}
                onChange={e => setArtistUrl(e.target.value)}
                className="text-sm h-9"
              />
              <Button size="sm" onClick={linkArtist} disabled={anyLoading || !artistUrl.trim()} className="shrink-0 gap-1.5">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
                Link Artist
              </Button>
            </div>
          </div>

          {s.top_tracks?.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Top Tracks</p>
              {s.top_tracks.slice(0, 5).map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-0.5">
                  <span className="truncate text-muted-foreground">{i + 1}. {t.title}</span>
                  {t.streams > 0 && <span className="text-primary/70 shrink-0 ml-2">{t.streams.toLocaleString()} streams</span>}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSync} disabled={anyLoading} className="flex-1 gap-1.5">
              {anyLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Sync Now
            </Button>
            <Button size="sm" variant="outline" onClick={handleDisconnect} disabled={anyLoading}
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
              <LogOut className="h-3.5 w-3.5" /> Disconnect
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Paste the link to your Spotify artist profile and SoundReady pulls your monthly listeners, total streams and top tracks automatically.</p>
          <div className="flex gap-2">
            <Input
              placeholder="https://open.spotify.com/artist/..."
              value={artistUrl}
              onChange={e => setArtistUrl(e.target.value)}
              className="text-sm h-9"
            />
            <Button onClick={linkArtist} disabled={anyLoading || !artistUrl.trim()} className="shrink-0 gap-2 bg-[#1DB954] hover:bg-[#1aa34a] text-black font-semibold">
              {anyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-lg leading-none">♪</span>}
              {anyLoading ? "Connecting..." : "Connect Artist Profile"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Find it on your artist page in the Spotify app, or open.spotify.com/artist/...</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
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
    }).catch(e => ({ data: { error: friendlyError(e) } }));
    setLoading(false);
    if (res.data?.error) { setError(res.data.error); return; }
    onUpdated(res.data?.data);
  };

  const handleSync = async () => {
    setLoading(true);
    setError("");
    const res = await base44.functions.invoke("syncPlatformData", { platform: "youtube_refresh" })
      .catch(e => ({ data: { error: friendlyError(e) } }));
    setLoading(false);
    if (res.data?.error) { setError(res.data.error); return; }
    onUpdated(res.data?.data);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("syncPlatformData", { platform: "youtube_disconnect" })
      .catch(e => ({ data: { error: friendlyError(e) } }));
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
function PlatformCard({ platform, conn, onUpdated, oauthLoading, oauthError }) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl ${platform.bg}`}>
            {platform.emoji}
          </div>
          <div>
            <p className="font-semibold text-sm">{platform.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {platform.id === "spotify" ? "Artist profile · Auto-synced"
                : platform.id === "youtube" ? "YouTube Data API v3 · Auto-synced daily"
                : platform.id === "tiktok" ? "TikTok Display API · Auto-synced"
                : "Manual entry"}
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          platform.id === "spotify" ? "bg-primary/10 text-primary border-primary/20"
            : platform.id === "youtube" ? "bg-red-500/10 text-red-400 border-red-500/20"
            : platform.id === "tiktok" ? "bg-chart-5/10 text-chart-5 border-chart-5/20"
            : "bg-secondary text-muted-foreground border-border"
        }`}>
          {platform.id === "spotify" ? "Sync" : platform.id === "youtube" ? "API" : platform.id === "tiktok" ? "OAuth" : "Manual"}
        </span>
      </div>

      {platform.id === "spotify" && <SpotifyCard conn={conn} onUpdated={onUpdated} oauthLoading={oauthLoading} oauthError={oauthError} />}
      {platform.id === "youtube" && <YouTubeCard conn={conn} onUpdated={onUpdated} />}
      {platform.id === "tiktok" && <TikTokCard conn={conn} onUpdated={onUpdated} />}
      {platform.id === "apple_music" && <ManualForm platform={platform} conn={conn} onUpdated={onUpdated} />}
    </motion.div>
  );
}

// ── Manual form for Apple Music ───────────────────────────────────────────────
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
    }).catch(e => ({ data: { error: friendlyError(e) } }));
    setLoading(false);
    if (res.data?.data) onUpdated(res.data.data);
  };

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
    }).catch(e => ({ data: { error: friendlyError(e) } }));
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
            <p className="text-xs text-muted-foreground mt-0.5">Update monthly for best Sam results</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-secondary text-muted-foreground border-border">Manual</span>
      </div>

      {conn && (
        <div className="rounded-xl bg-secondary/40 border border-border p-3 grid grid-cols-2 gap-2">
          <Stat label="Email List" value={(existing.email_list_size || 0).toLocaleString()} />
          <Stat label="Merch Revenue" value={existing.merch_revenue_12mo ? `$${existing.merch_revenue_12mo.toLocaleString()}` : "—"} />
          <Stat label="Press Placements" value={existing.press_placements || "—"} />
          <Stat label="Sync Placements" value={existing.sync_placements || "—"} />
          {conn.last_synced && <p className="col-span-2"><FreshnessBadge last_synced={conn.last_synced} /></p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
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



const PLATFORMS = [
  { id: "spotify", name: "Spotify", emoji: "🎵", bg: "bg-green-500/10" },
  { id: "youtube", name: "YouTube", emoji: "▶️", bg: "bg-red-500/10" },
  { id: "tiktok", name: "TikTok", emoji: "🎵", bg: "bg-zinc-800" },
  { id: "apple_music", name: "Apple Music", emoji: "🍎", bg: "bg-pink-500/10" },
];

// The "Connect Your Profiles" experience, now a section of the Artist Profile page.
export default function ConnectProfilesSection() {
  const { user, checkAppState } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState({});
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthError, setOauthError] = useState("");
  const [accountType, setAccountType] = useState("artist");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (user?.id) setAccountType(user.account_type || "artist");
  }, [user?.id, user?.account_type]);

  // Handle Spotify OAuth callback (Spotify redirects back to /connect-profiles,
  // which renders the Artist Profile page containing this section)
  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (!code || !state) return;

    setSearchParams({}, { replace: true });

    setOauthLoading(true);
    setOauthError("");
    base44.functions.invoke("spotifyOAuth", {
      action: "exchange_code",
      code,
      state,
      redirect_uri: "https://soundready.ai/connect-profiles",
    }).then(res => {
      setOauthLoading(false);
      if (res.data?.error) { setOauthError(res.data.error); return; }
      if (res.data?.data) setConnections(prev => ({ ...prev, spotify: res.data.data }));
    }).catch(e => {
      setOauthLoading(false);
      setOauthError(friendlyError(e));
    });
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.PlatformConnection.filter({ created_by_id: user.id }, "-created_date", 20)
      .then(conns => {
        const map = {};
        conns.forEach(c => { map[c.platform] = c; });
        setConnections(map);
      })
      .catch(() => {});
  }, [user]);

  // Keep a connected TikTok fresh: quietly re-sync whenever it's over a day old
  useEffect(() => {
    const t = connections.tiktok;
    if (!t || t.connection_type !== "oauth" || t.status !== "connected") return;
    const ageMs = t.last_synced ? Date.now() - new Date(t.last_synced).getTime() : Infinity;
    if (ageMs < 24 * 60 * 60 * 1000) return;
    base44.functions.invoke("syncPlatformData", { platform: "tiktok_sync" })
      .then(res => { if (res.data?.data) setConnections(prev => ({ ...prev, tiktok: res.data.data })); })
      .catch(() => {});
  }, [connections.tiktok?.id, connections.tiktok?.last_synced, connections.tiktok?.connection_type]);

  // Same for a linked Spotify artist: re-read the public numbers when they're over a day old
  useEffect(() => {
    const sp = connections.spotify;
    if (!sp || sp.status !== "connected" || !sp.profile_url || !sp.stats?.artist_id) return;
    const ageMs = sp.last_synced ? Date.now() - new Date(sp.last_synced).getTime() : Infinity;
    if (ageMs < 24 * 60 * 60 * 1000) return;
    base44.functions.invoke("spotifyOAuth", { action: "link_artist", artist_url: sp.profile_url })
      .then(res => { if (res.data?.data) setConnections(prev => ({ ...prev, spotify: res.data.data })); })
      .catch(() => {});
  }, [connections.spotify?.id, connections.spotify?.last_synced]);

  const handleAccountType = async (key) => {
    setAccountType(key);
    await base44.auth.updateMe({ account_type: key }).catch(() => {});
    await checkAppState();
  };

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

  return (
    <div className="space-y-6">

      {/* Step 1 onboarding — pick your role before anything else */}
      {user?.onboarding_complete !== true && (
        <div className="rounded-2xl border border-primary/25 bg-primary/10 p-5 space-y-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">Step 1</span>
            <p className="font-heading font-bold text-lg">First — what kind of creator are you?</p>
          </div>
          <AccountTypePicker value={accountType} onChange={handleAccountType} />
          <p className="text-xs text-muted-foreground">Your tools adapt to your role. You can change this anytime from your Profile.</p>
        </div>
      )}

      {/* Sam upgrade banner for non-AI-Manager users */}
      {!(user?.role === "admin" || user?.subscription_tier === "ai_manager") && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Your connected data powers Sam.</span> Upgrade to Digital Manager to unlock Sam.
          </p>
          <Link to="/pricing-account" className="text-xs font-semibold text-primary whitespace-nowrap hover:underline">
            Upgrade →
          </Link>
        </div>
      )}

      {/* Data summary */}
      <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Sam has access to <span className="text-primary">{totalDataPoints} data points</span> about your career</p>
          <p className="text-xs text-muted-foreground mt-0.5">Spotify, YouTube, and TikTok sync automatically. Apple Music is entered manually.</p>
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
            <PlatformCard key={p.id} platform={p} conn={connections[p.id] || null} onUpdated={handleUpdated(p.id)}
              oauthLoading={p.id === "spotify" ? oauthLoading : false}
              oauthError={p.id === "spotify" ? oauthError : ""}
            />
          ))}
        </div>
      </section>

      {/* Step 2 onboarding banner — sits below the platform cards so linking
          profiles is the first thing available, not just the skip button */}
      {user?.onboarding_complete !== true && (
        <div className="rounded-2xl border border-primary/25 bg-primary/10 p-5 space-y-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">Step 2</span>
            <p className="font-heading font-bold text-lg">Done connecting?</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connected data powers Sam's advice, your roadmap and your release strategy. Spotify, YouTube, and TikTok sync automatically. Apple Music stats are entered manually.
          </p>
          <Button
            onClick={async () => {
              await base44.auth.updateMe({ onboarding_complete: true }).catch(() => {});
              await checkAppState();
              navigate("/history");
            }}
            variant={connectedCount > 0 ? "default" : "outline"}
            className="gap-2 w-fit"
          >
            {connectedCount > 0 ? "I'm Done — Go to Dashboard" : "Skip for now"} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Self-Reported */}
      <section className="space-y-4">
        <div>
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" /> Self-Reported Stats
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Numbers that can't be pulled automatically. Show and ticket stats live in your profile's Live & Touring section.</p>
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
              {connectedCount === 0 && "Connect at least Spotify or YouTube to get real data into Sam."}
              {connectedCount > 0 && connectedCount < 3 && "Good start! Connect more platforms for richer AI advice."}
              {connectedCount >= 3 && "🔥 Sam has strong context about your career."}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}