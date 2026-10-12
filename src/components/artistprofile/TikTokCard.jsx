import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, LogOut } from "lucide-react";
import { FreshnessBadge, Stat, Field } from "@/components/artistprofile/platformShared";

// "Artist TikTok" workspace connector — each artist connects their own account
export const TIKTOK_CONNECTOR_ID = "6ac576aac6c81b30e8f0a86d";

export default function TikTokCard({ conn, onUpdated }) {
  const isOAuth = conn?.status === "connected" && conn?.connection_type === "oauth";
  const existing = conn?.stats || {};
  const [form, setForm] = useState({ ...existing });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Refresh the editable fields whenever a sync brings new numbers in
  useEffect(() => { setForm({ ...(conn?.stats || {}) }); }, [conn?.last_synced]);

  const syncNow = async () => {
    setLoading(true); setError("");
    const res = await base44.functions.invoke("syncPlatformData", { platform: "tiktok_sync" })
      .catch(e => ({ data: { error: e.message } }));
    setLoading(false);
    if (res.data?.error) { setError(res.data.error); return; }
    if (res.data?.data) onUpdated(res.data.data);
  };

  const handleConnect = async () => {
    setLoading(true); setError("");
    let url;
    try {
      url = await base44.connectors.connectAppUser(TIKTOK_CONNECTOR_ID);
    } catch (e) {
      setLoading(false); setError(e.message); return;
    }
    const popup = window.open(url, "_blank");
    if (!popup) { setLoading(false); setError("Allow popups to connect TikTok."); return; }
    // When the consent tab closes, pull the fresh stats in
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        syncNow();
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await base44.connectors.disconnectAppUser(TIKTOK_CONNECTOR_ID).catch(() => {});
    const res = await base44.functions.invoke("syncPlatformData", { platform: "tiktok_disconnect" })
      .catch(e => ({ data: { error: e.message } }));
    setLoading(false);
    if (res.data?.success) onUpdated(null);
    else setError(res.data?.error || "Failed to disconnect");
  };

  // Artist-entered details the API can't provide (handle, avg views per video)
  const saveManual = async () => {
    setLoading(true); setError("");
    const res = await base44.functions.invoke("syncPlatformData", {
      platform: "manual",
      sub_platform: "tiktok",
      manual_stats: form,
    }).catch(e => ({ data: { error: e.message } }));
    setLoading(false);
    if (res.data?.data) onUpdated(res.data.data);
  };

  // Not connected yet: OAuth button plus the manual fallback
  if (!isOAuth) return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Connect your TikTok account to automatically pull followers, likes, and video counts.</p>
      <Button onClick={handleConnect} disabled={loading} className="gap-2 bg-black text-white hover:bg-zinc-800 font-semibold">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-lg leading-none">♪</span>}
        {loading ? "Connecting..." : "Connect TikTok"}
      </Button>
      <p className="text-xs text-muted-foreground">You'll approve access in a new tab. Or enter your stats manually below.</p>

      <div className="pt-2 border-t border-border space-y-3">
        {conn && (
          <div className="rounded-xl bg-secondary/40 border border-border p-3 grid grid-cols-2 gap-2">
            <Stat label="Followers" value={existing.followers ? existing.followers.toLocaleString() : "—"} />
            <Stat label="Total Likes" value={existing.total_likes ? existing.total_likes.toLocaleString() : "—"} />
            <Stat label="Videos" value={existing.video_count || "—"} />
            <Stat label="Avg Views / Video" value={existing.avg_views_per_video ? existing.avg_views_per_video.toLocaleString() : "—"} />
            {conn.last_synced && <p className="col-span-2"><FreshnessBadge last_synced={conn.last_synced} /></p>}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="TikTok Handle" value={form.tiktok_handle || ""} onChange={v => set("tiktok_handle", v)} placeholder="yourname" />
          </div>
          <Field label="Followers" value={form.followers || ""} onChange={v => set("followers", Number(v))} placeholder="12000" type="number" />
          <Field label="Total Likes" value={form.total_likes || ""} onChange={v => set("total_likes", Number(v))} placeholder="450000" type="number" />
          <Field label="Video Count" value={form.video_count || ""} onChange={v => set("video_count", Number(v))} placeholder="35" type="number" />
          <Field label="Avg Views per Video" value={form.avg_views_per_video || ""} onChange={v => set("avg_views_per_video", Number(v))} placeholder="8500" type="number" />
        </div>
        <Button size="sm" onClick={saveManual} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save TikTok Stats
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );

  // Connected: synced stats, with handle and avg views as manual supplements
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-border p-3">
        {conn.profile_image_url && (
          <img src={conn.profile_image_url} alt="TikTok profile" className="h-10 w-10 rounded-full object-cover" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{conn.display_name}</p>
          <FreshnessBadge last_synced={conn.last_synced} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Followers" value={(existing.followers || 0).toLocaleString()} />
        <Stat label="Total Likes" value={(existing.total_likes || 0).toLocaleString()} />
        <Stat label="Videos" value={(existing.video_count || 0).toLocaleString()} />
        <Stat label="Avg Views / Video" value={existing.avg_views_per_video ? existing.avg_views_per_video.toLocaleString() : "—"} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Field label="TikTok Handle" value={form.tiktok_handle || ""} onChange={v => set("tiktok_handle", v)} placeholder="yourname" />
        </div>
        <Field label="Avg Views per Video" value={form.avg_views_per_video || ""} onChange={v => set("avg_views_per_video", Number(v))} placeholder="8500" type="number" />
        <div className="flex items-end">
          <Button size="sm" variant="outline" onClick={saveManual} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={syncNow} disabled={loading} className="flex-1 gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Sync Now
        </Button>
        <Button size="sm" variant="outline" onClick={handleDisconnect} disabled={loading}
          className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
          <LogOut className="h-3.5 w-3.5" /> Disconnect
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}