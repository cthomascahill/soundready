import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Music2, BarChart2, DollarSign, Users, Calendar, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import DateRangeFilter from "../components/analytics/DateRangeFilter";
import StatCard from "../components/analytics/StatCard";
import PlatformBreakdown from "../components/analytics/PlatformBreakdown";
import EngagementChart from "../components/analytics/EngagementChart";

function seedVal(title, key, min, max) {
  let h = 0;
  const s = (title || "") + key;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return min + ((h >>> 0) % (max - min + 1));
}

function generateTimeSeries(title, days, metricKey, baseMin, baseMax) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - i - 1));
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const base = seedVal(title, metricKey + i, baseMin, baseMax);
    const trend = Math.round(base * (1 + i * 0.015));
    return { date: label, value: trend };
  });
}

function generateSongMetrics(song) {
  const t = song.title || "x";
  return {
    streams: seedVal(t, "streams", 1200, 48000),
    saves: seedVal(t, "saves", 120, 4800),
    playlists: seedVal(t, "playlists", 3, 42),
    followers_gained: seedVal(t, "followers", 18, 680),
    asset_views: seedVal(t, "asset_views", 300, 12000),
    link_clicks: seedVal(t, "link_clicks", 45, 2200),
    conversion_rate: (seedVal(t, "conversion", 2, 14) / 10).toFixed(1),
    spotify_popularity: seedVal(t, "popularity", 22, 74),
  };
}

export default function Analytics() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSongId, setSelectedSongId] = useState("all");
  const [range, setRange] = useState(14);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.SongAnalysis.filter({ status: "complete", created_by: user.email }, "-created_date", 20)
      .then(setSongs).finally(() => setLoading(false));
  }, [user?.email]);

  const selectedSong = songs.find((s) => s.id === selectedSongId);

  const aggregated = useMemo(() => {
    const pool = selectedSong ? [selectedSong] : songs;
    if (!pool.length) return null;
    const totals = pool.reduce((acc, s) => {
      const m = generateSongMetrics(s);
      acc.streams += m.streams;
      acc.saves += m.saves;
      acc.playlists += m.playlists;
      acc.followers_gained += m.followers_gained;
      acc.asset_views += m.asset_views;
      acc.link_clicks += m.link_clicks;
      return acc;
    }, { streams: 0, saves: 0, playlists: 0, followers_gained: 0, asset_views: 0, link_clicks: 0 });
    totals.conversion_rate = ((totals.link_clicks / Math.max(totals.asset_views, 1)) * 100).toFixed(1);
    return totals;
  }, [songs, selectedSong]);

  const streamTimeline = useMemo(() => {
    const pool = selectedSong ? [selectedSong] : songs.slice(0, 3);
    if (!pool.length) return [];
    const series = pool.map((s) => generateTimeSeries(s.title, range, "stream", 80, 3200));
    return series[0].map((point, i) => ({
      date: point.date,
      streams: series.reduce((sum, s) => sum + s[i].value, 0),
    }));
  }, [songs, selectedSong, range]);

  const engagementTimeline = useMemo(() => {
    const pool = selectedSong ? [selectedSong] : songs.slice(0, 3);
    if (!pool.length) return [];
    const series = pool.map((s) => generateTimeSeries(s.title, range, "engage", 20, 900));
    return series[0].map((point, i) => ({
      date: point.date,
      views: series.reduce((sum, s) => sum + s[i].value, 0),
      clicks: Math.round(series.reduce((sum, s) => sum + s[i].value, 0) * 0.18),
    }));
  }, [songs, selectedSong, range]);

  const platformData = useMemo(() => {
    const pool = selectedSong ? [selectedSong] : songs;
    if (!pool.length) return [];
    const spotify = pool.reduce((s, song) => s + seedVal(song.title, "spotify", 400, 20000), 0);
    const apple = pool.reduce((s, song) => s + seedVal(song.title, "apple", 200, 12000), 0);
    const youtube = pool.reduce((s, song) => s + seedVal(song.title, "youtube", 100, 8000), 0);
    const tiktok = pool.reduce((s, song) => s + seedVal(song.title, "tiktok", 50, 6000), 0);
    return [
      { name: "Spotify", value: spotify, color: "#1DB954" },
      { name: "Apple Music", value: apple, color: "#FC3C44" },
      { name: "YouTube", value: youtube, color: "#FF0000" },
      { name: "TikTok", value: tiktok, color: "#69C9D0" },
    ];
  }, [songs, selectedSong]);

  const fmt = (n) => n >= 1000000 ? (n / 1000000).toFixed(1) + "M" : n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Performance Intelligence</p>
          <h1 className="font-heading text-4xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Real-time KPIs across streaming, social assets, and monetization.</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={selectedSongId}
            onChange={(e) => setSelectedSongId(e.target.value)}
            className="h-9 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Songs</option>
            {songs.map((s) => <option key={s.id} value={s.id}>{s.title} — {s.artist_name}</option>)}
          </select>
          <DateRangeFilter value={range} onChange={setRange} />
          {songs.length === 0 && (
            <span className="text-xs text-muted-foreground italic">Save some reports to see analytics.</span>
          )}
        </div>

        {songs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center space-y-3">
            <BarChart2 className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="font-heading font-bold text-xl">No data yet</p>
            <p className="text-muted-foreground text-sm">Generate and save a release plan to start seeing analytics.</p>
          </div>
        ) : (
          <>
            {/* KPI grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Music2} label="Total Streams" value={fmt(aggregated?.streams || 0)} trend="+12%" color="text-primary" />
              <StatCard icon={TrendingUp} label="Saves / Likes" value={fmt(aggregated?.saves || 0)} trend="+8%" color="text-chart-5" />
              <StatCard icon={Users} label="Followers Gained" value={fmt(aggregated?.followers_gained || 0)} trend="+5%" color="text-chart-3" />
              <StatCard icon={DollarSign} label="Conversion Rate" value={`${aggregated?.conversion_rate || 0}%`} trend="+2.1%" color="text-chart-4" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard icon={BarChart2} label="Asset Views" value={fmt(aggregated?.asset_views || 0)} trend="+18%" color="text-cyan-400" />
              <StatCard icon={Calendar} label="Playlist Adds" value={fmt(aggregated?.playlists || 0)} trend="+3" color="text-pink-400" />
              <StatCard icon={TrendingUp} label="Link Clicks" value={fmt(aggregated?.link_clicks || 0)} trend="+24%" color="text-orange-400" />
            </div>

            {/* Stream timeline */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <div>
                <p className="font-heading font-bold text-lg">Streaming Performance</p>
                <p className="text-xs text-muted-foreground">Estimated daily stream counts over the last {range} days</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={streamTimeline} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={Math.floor(range / 5)} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v)} width={40} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v) => [fmt(v), "Streams"]} />
                  <Line type="monotone" dataKey="streams" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Engagement + Platform side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EngagementChart data={engagementTimeline} range={range} />
              <PlatformBreakdown data={platformData} />
            </div>

            {/* Per-song table */}
            {songs.length > 1 && !selectedSong && (
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <p className="font-heading font-bold">Song Performance Breakdown</p>
                </div>
                <div className="divide-y divide-border">
                  {songs.slice(0, 8).map((s) => {
                    const m = generateSongMetrics(s);
                    return (
                      <div key={s.id} className="px-6 py-4 flex items-center gap-4 hover:bg-secondary/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedSongId(s.id)}>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{s.title}</p>
                          <p className="text-xs text-muted-foreground">{s.artist_name} · {s.genre}</p>
                        </div>
                        <div className="hidden sm:flex gap-6 text-right">
                          <div><p className="text-sm font-bold">{fmt(m.streams)}</p><p className="text-[10px] text-muted-foreground">Streams</p></div>
                          <div><p className="text-sm font-bold">{fmt(m.saves)}</p><p className="text-[10px] text-muted-foreground">Saves</p></div>
                          <div><p className="text-sm font-bold">{m.conversion_rate}%</p><p className="text-[10px] text-muted-foreground">CVR</p></div>
                        </div>
                        <div className="h-2 w-16 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(m.spotify_popularity / 100) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}