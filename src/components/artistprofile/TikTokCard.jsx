import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, LogOut, AlertTriangle } from "lucide-react";
import { getFreshness } from "@/components/artistprofile/connectProfilesFreshness";

// The workspace-registered TikTok connector — each artist connects their own account
const TIKTOK_CONNECTOR_ID = "6ac576aac6c81b30e8f0a86d";

export default function TikTokCard({ conn, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pulls fresh stats from TikTok — also serves as the connection check
  const sync = async () => {
    setLoading(true);
    setError("");
    const res = await base44.functions.invoke("tiktokSync", { action: "sync" })
      .catch(e => ({ data: { error: e.message } }));
    setLoading(false);
    if (res.data?.error) {
      if (res.data.needs_connect) { onUpdated(null); return; }
      setError(res.data.error);
      if (res.data.needs_reconnect) onUpdated(null);
      return;
    }
    if (res.data?.data) onUpdated(res.data.data);
  };

  // Keep stats fresh every time the profile page opens
  useEffect(() => { sync(); }, []);

  const handleConnect = async () => {
    setError("");
    setLoading(true);
    try {
      const url = await base44.connectors.connectAppUser(TIKTOK_CONNECTOR_ID);
      const popup = window.open(url, "_blank");
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          sync();
        }
      }, 500);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try { await base44.connectors.disconnectAppUser(TIKTOK_CONNECTOR_ID); } catch (e) { /* grant already gone */ }
    await base44.functions.invoke("tiktokSync", { action: "disconnect" }).catch(() => {});
    setLoading(false);
    onUpdated(null);
  };

  const isConnected = conn?.status === "connected";
  const s = conn?.stats || {};
  const f = getFreshness(conn?.last_synced);

  return (
    <div className="space-y-4">
      {isConnected ? (
        <>
          <div className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-border p-3">
            {conn.profile_image_url && (
              <img src={conn.profile_image_url} alt="TikTok profile" className="h-10 w-10 rounded-full object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{conn.display_name || "TikTok"}</p>
              <div className={`flex items-center gap-1.5 text-xs font-medium ${f.textColor}`}>
                <span className={`h-2 w-2 rounded-full ${f.color} ${f.status === "live" ? "animate-pulse" : ""}`} />
                {f.label}
                {conn.last_synced && <span className="text-muted-foreground font-normal">· {new Date(conn.last_synced).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Stat label="Followers" value={(s.followers || 0).toLocaleString()} />
            <Stat label="Total Likes" value={(s.total_likes || 0).toLocaleString()} />
            <Stat label="Videos" value={(s.video_count || 0).toLocaleString()} />
            <Stat label="Following" value={(s.following || 0).toLocaleString()} />
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={sync} disabled={loading} className="flex-1 gap-1.5">
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
          <p className="text-sm text-muted-foreground">Connect your TikTok account to automatically pull followers, likes and video stats.</p>
          <Button onClick={handleConnect} disabled={loading} className="gap-2 bg-[#000000] hover:bg-[#000000]/80 text-white font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-lg leading-none">♪</span>}
            {loading ? "Connecting..." : "Connect TikTok"}
          </Button>
          <p className="text-xs text-muted-foreground">You'll approve access in a TikTok popup. Scopes: profile info, follower &amp; video stats.</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
          {!isConnected && (
            <Button size="sm" onClick={handleConnect} disabled={loading} className="ml-auto h-6 text-xs px-2">Connect</Button>
          )}
        </div>
      )}
    </div>
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