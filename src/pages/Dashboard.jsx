import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, Music, Upload, Star, Zap, ChevronRight, BarChart3,
  ArrowUpRight, ArrowDownRight, Minus, Calendar, Users, ImagePlay, Palette, MessageSquare, BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

const QUICK_ACTIONS = [
  { label: "Analyze Track", desc: "Upload and score a new song", icon: Upload, path: "/upload", color: "primary" },
  { label: "Growth Tracker", desc: "Monitor score trends", icon: TrendingUp, path: "/growth", color: "accent" },
  { label: "Marketing Assets", desc: "Generate promo graphics", icon: ImagePlay, path: "/marketing", color: "chart4" },
  { label: "Curator CRM", desc: "Manage pitching contacts", icon: Users, path: "/contacts", color: "chart3" },
  { label: "Mood Board", desc: "Visual brand identity", icon: Palette, path: "/moodboard", color: "chart5" },
  { label: "Competitor Intel", desc: "Track similar artists", icon: BarChart2, path: "/competitors", color: "primary" },
];

const COLOR_MAP = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20 hover:border-primary/50" },
  accent: { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20 hover:border-accent/50" },
  chart3: { bg: "bg-chart-3/10", text: "text-chart-3", border: "border-chart-3/20 hover:border-chart-3/50" },
  chart4: { bg: "bg-chart-4/10", text: "text-chart-4", border: "border-chart-4/20 hover:border-chart-4/50" },
  chart5: { bg: "bg-chart-5/10", text: "text-chart-5", border: "border-chart-5/20 hover:border-chart-5/50" },
};

function StatCard({ label, value, sub, trend, icon: Icon, delay, color = "primary" }) {
  const c = COLOR_MAP[color] || COLOR_MAP.primary;
  const TrendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
  const trendColor = trend > 0 ? "text-accent" : trend < 0 ? "text-destructive" : "text-muted-foreground";
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${c.bg}`}>
          <Icon className={`h-4 w-4 ${c.text}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trend !== 0 ? `${Math.abs(trend).toFixed(1)}` : "—"}
          </div>
        )}
      </div>
      <p className="font-heading text-3xl font-bold leading-none mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/50 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-card border border-border p-3 shadow-xl text-xs">
      <p className="text-muted-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-heading font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function getScoreColor(score) {
  if (score >= 80) return "text-accent";
  if (score >= 60) return "text-chart-4";
  return "text-muted-foreground";
}

export default function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SongAnalysis.filter({ status: "complete" }, "created_date", 50).then((items) => {
      setAnalyses(items);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const totalSongs = analyses.length;
  const avgScore = totalSongs > 0 ? Math.round(analyses.reduce((s, a) => s + (a.overall_score || 0), 0) / totalSongs) : 0;
  const bestScore = totalSongs > 0 ? Math.max(...analyses.map((a) => a.overall_score || 0)) : 0;
  const avgProduction = totalSongs > 0 ? Math.round(analyses.reduce((s, a) => s + (a.production_quality || 0), 0) / totalSongs) : 0;

  const mid = Math.floor(totalSongs / 2);
  const firstAvg = mid > 0 ? analyses.slice(0, mid).reduce((s, a) => s + (a.overall_score || 0), 0) / mid : 0;
  const secondAvg = mid > 0 ? analyses.slice(mid).reduce((s, a) => s + (a.overall_score || 0), 0) / analyses.slice(mid).length : 0;
  const scoreTrend = totalSongs >= 2 ? secondAvg - firstAvg : 0;

  const chartData = analyses.map((a) => ({
    name: moment(a.created_date).format("MMM D"),
    "Overall": a.overall_score || 0,
    "Production": a.production_quality || 0,
    "Hook": a.hook_strength || 0,
  }));

  const recentSongs = [...analyses].reverse().slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">Dashboard</p>
          <h1 className="font-heading text-3xl font-bold">
            {totalSongs === 0 ? "Welcome to Sound Ready" : "Your Artist Hub"}
          </h1>
          {totalSongs > 0 && (
            <p className="text-muted-foreground mt-1 text-sm">
              {totalSongs} track{totalSongs !== 1 ? "s" : ""} analyzed · avg score {avgScore}
            </p>
          )}
        </div>
        <Link to="/upload">
          <Button className="gap-2 shrink-0">
            <Upload className="h-4 w-4" />Analyze New Track
          </Button>
        </Link>
      </motion.div>

      {totalSongs === 0 ? (
        /* Empty state */
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-dashed border-border p-14 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-heading text-xl font-semibold mb-2">No tracks yet</h2>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Upload your first track to start tracking algorithmic performance across Spotify, Apple Music, TikTok, and YouTube.
            </p>
            <Link to="/upload">
              <Button size="lg" className="gap-2"><Upload className="h-4 w-4" />Upload Your First Track</Button>
            </Link>
          </motion.div>

          {/* Quick actions even on empty */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Explore Tools</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {QUICK_ACTIONS.map(({ label, desc, icon: Icon, path, color }, i) => {
                const c = COLOR_MAP[color];
                return (
                  <Link key={path} to={path}>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={`rounded-xl bg-card border p-4 hover:scale-[1.02] transition-all ${c.border}`}>
                      <div className={`h-8 w-8 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
                        <Icon className={`h-4 w-4 ${c.text}`} />
                      </div>
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Avg Score" value={avgScore} icon={BarChart3} delay={0.04} trend={scoreTrend} color="primary" />
            <StatCard label="Tracks" value={totalSongs} icon={Music} delay={0.08} color="accent" />
            <StatCard label="Best Score" value={bestScore} sub="all time" icon={Star} delay={0.12} color="chart4" />
            <StatCard label="Avg Production" value={avgProduction} icon={Zap} delay={0.16} color="chart3" />
          </div>

          {/* Chart + Recent tracks side by side on large screens */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Chart */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="xl:col-span-3 rounded-2xl bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-heading font-semibold text-lg">Performance Trends</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Score history across all uploads</p>
                </div>
                {scoreTrend !== 0 && (
                  <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    scoreTrend > 0 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                  }`}>
                    <TrendingUp className="h-3 w-3" />{scoreTrend > 0 ? "+" : ""}{scoreTrend.toFixed(1)} avg
                  </span>
                )}
              </div>
              {chartData.length < 2 ? (
                <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">
                  Upload 2+ tracks to see your trend chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} iconType="circle" iconSize={7} />
                    <Line type="monotone" dataKey="Overall" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="Production" stroke="hsl(var(--accent))" strokeWidth={1.5} strokeDasharray="4 3" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="Hook" stroke="hsl(var(--chart-4))" strokeWidth={1.5} strokeDasharray="4 3" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Recent tracks */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
              className="xl:col-span-2 rounded-2xl bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">Recent Tracks</h2>
                <Link to="/history" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                  All <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-1">
                {recentSongs.map((a, i) => (
                  <Link key={a.id} to={`/song?id=${a.id}`}>
                    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.04 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/50 transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Music className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.artist_name}</p>
                      </div>
                      <span className={`font-heading text-lg font-bold shrink-0 ${getScoreColor(a.overall_score)}`}>
                        {a.overall_score}
                      </span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {QUICK_ACTIONS.map(({ label, desc, icon: Icon, path, color }, i) => {
                const c = COLOR_MAP[color];
                return (
                  <Link key={path} to={path}>
                    <div className={`rounded-xl bg-card border p-4 hover:scale-[1.02] transition-all h-full ${c.border}`}>
                      <div className={`h-8 w-8 rounded-lg ${c.bg} flex items-center justify-center mb-2`}>
                        <Icon className={`h-4 w-4 ${c.text}`} />
                      </div>
                      <p className="font-medium text-sm leading-tight">{label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}