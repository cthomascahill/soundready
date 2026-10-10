import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Music2, ExternalLink, Loader2, Users, Star, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function fmt(n) {
  n = Number(n || 0);
  return n >= 1000000 ? (n / 1000000).toFixed(2) + "M" : n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}

const num = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

// Spotify profile connection. Spotify doesn't allow third-party apps to pull
// artist stats for most accounts, so the artist pastes their artist link and
// enters their numbers from Spotify for Artists — the same place Sam reads them.
export default function SpotifyConnect() {
  const [connected, setConnected] = useState(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [stats, setStats] = useState({ followers: "", monthly_listeners: "", popularity: "" });
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    base44.entities.SpotifyConnection.list("-updated_date", 1)
      .then((r) => { if (r.length) loadConnected(r[0]); })
      .catch(() => {});
  }, []);

  const loadConnected = (conn) => {
    setConnected(conn);
    setUrl(conn.spotify_url || "");
    setName(conn.artist_name || "");
    setStats({
      followers: conn.followers ?? "",
      monthly_listeners: conn.monthly_listeners ?? "",
      popularity: conn.popularity ?? "",
    });
  };

  const save = async () => {
    setError("");
    const match = url.trim().match(/spotify\.com(?:\/intl-[a-z]+)?\/artist\/([A-Za-z0-9]+)/);
    if (!match) {
      setError("Paste your Spotify artist link — it looks like open.spotify.com/artist/...");
      return;
    }
    if (!name.trim()) {
      setError("Enter the artist name shown on your Spotify profile.");
      return;
    }
    setSaving(true);
    try {
      const data = {
        spotify_artist_id: match[1],
        artist_name: name.trim(),
        artist_image_url: connected?.artist_image_url || "",
        followers: num(stats.followers) || 0,
        popularity: num(stats.popularity) || 0,
        genres: connected?.genres || [],
        spotify_url: url.trim(),
        monthly_listeners: num(stats.monthly_listeners) || 0,
        last_synced: new Date().toISOString(),
      };
      let record;
      if (connected) {
        await base44.entities.SpotifyConnection.update(connected.id, data);
        record = { ...connected, ...data };
      } else {
        record = await base44.entities.SpotifyConnection.create(data);
      }
      loadConnected(record);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (e) {
      setError(e.message || "Couldn't save your Spotify profile.");
    }
    setSaving(false);
  };

  const disconnect = async () => {
    if (!connected) return;
    await base44.entities.SpotifyConnection.delete(connected.id);
    setConnected(null);
    setUrl("");
    setName("");
    setStats({ followers: "", monthly_listeners: "", popularity: "" });
  };

  const setStat = (k) => (e) => setStats((s) => ({ ...s, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#1DB954] flex items-center justify-center">
              <Music2 className="h-4 w-4 text-black" />
            </div>
            <p className="text-xs text-[#1DB954] uppercase tracking-widest font-medium">Spotify</p>
          </div>
          <h1 className="font-heading text-4xl font-bold">Your Spotify Profile</h1>
          <p className="text-muted-foreground">
            {connected
              ? "These numbers power Sam's advice, pitches and your roadmap. Update them from Spotify for Artists whenever they change."
              : "Link your artist profile and enter your numbers from Spotify for Artists. Sam uses them for advice, pitches and your roadmap."}
          </p>
        </motion.div>

        {connected && (
          <>
            <div className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-center gap-4 flex-wrap">
                {connected.artist_image_url ? (
                  <img src={connected.artist_image_url} alt={connected.artist_name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-[#1DB954]" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-[#1DB954]/15 flex items-center justify-center border-2 border-[#1DB954]">
                    <Music2 className="h-7 w-7 text-[#1DB954]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-heading font-bold text-2xl">{connected.artist_name}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {connected.last_synced ? new Date(connected.last_synced).toLocaleString() : "—"}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {connected.spotify_url && (
                    <a href={connected.spotify_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-1.5"><ExternalLink className="h-3.5 w-3.5" /> Open Spotify</Button>
                    </a>
                  )}
                  <Button variant="ghost" size="sm" onClick={disconnect} className="text-muted-foreground hover:text-destructive">Disconnect</Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-card border border-border p-4 space-y-1">
                <Users className="h-4 w-4 text-[#1DB954]" />
                <p className="font-heading font-bold text-xl text-[#1DB954]">{fmt(connected.monthly_listeners)}</p>
                <p className="text-xs text-muted-foreground">Monthly Listeners</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-4 space-y-1">
                <Users className="h-4 w-4 text-chart-5" />
                <p className="font-heading font-bold text-xl text-chart-5">{fmt(connected.followers)}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-4 space-y-1">
                <Star className="h-4 w-4 text-chart-4" />
                <p className="font-heading font-bold text-xl text-chart-4">{connected.popularity || 0}/100</p>
                <p className="text-xs text-muted-foreground">Popularity</p>
              </div>
            </div>
          </>
        )}

        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <p className="font-heading font-semibold">{connected ? "Edit your numbers" : "Connect your artist profile"}</p>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Spotify artist link *</label>
            <Input placeholder="https://open.spotify.com/artist/..." value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Artist name *</label>
            <Input placeholder="Your artist name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Monthly Listeners</label>
              <Input type="number" placeholder="e.g. 15000" value={stats.monthly_listeners} onChange={setStat("monthly_listeners")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Followers</label>
              <Input type="number" placeholder="e.g. 8000" value={stats.followers} onChange={setStat("followers")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Popularity (0–100)</label>
              <Input type="number" placeholder="e.g. 42" value={stats.popularity} onChange={setStat("popularity")} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Find these in Spotify for Artists. Spotify doesn't allow apps to pull them automatically for most artist accounts.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : savedFlash ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : savedFlash ? "Saved!" : connected ? "Update Profile" : "Connect Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}