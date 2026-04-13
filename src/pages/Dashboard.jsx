import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import { TrendingUp, Music, Upload, Star, Zap, ChevronRight, BarChart3, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

function StatCard({ label, value, sub, trend, icon: Icon, delay, color = "primary" }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    chart3: "bg-chart-3/10 text-chart-3",
    chart4: "bg-chart-4/10 text-chart-4",
  };

  const TrendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
  const trendColor = trend > 0 ? "text-accent" : trend < 0 ? "text-destructive" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl bg-card border border-border p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trend !== 0 ? `${Math.abs(trend).toFixed(1)} pts` : "Stable"}
          </div>
        )}
      </div>
      <p className="font-heading text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-card border border-border p-3 shadow-xl text-sm">
      <p className="text-muted-foreground text-xs mb-2">{label}</p>
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

export default function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const items = await base44.entities.SongAnalysis.filter({ status: "complete" }, "created_date", 50);
      setAnalyses(items);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Compute stats
  const totalSongs = analyses.length;
  const avgScore = totalSongs > 0
    ? Math.round(analyses.reduce((s, a) => s + (a.overall_score || 0), 0) / totalSongs)
    : 0;
  const bestScore = totalSongs > 0 ? Math.max(...analyses.map((a) => a.overall_score || 0)) : 0;
  const avgProduction = totalSongs > 0
    ? Math.round(analyses.reduce((s, a) => s + (a.production_quality || 0), 0) / totalSongs)
    : 0;

  // Trend: compare last half vs first half
  const midpoint = Math.floor(totalSongs / 2);
  const firstHalf = analyses.slice(0, midpoint);
  const secondHalf = analyses.slice(midpoint);
  const firstAvg = firstHalf.length ? firstHalf.reduce((s, a) => s + (a.overall_score || 0), 0) / firstHalf.length : 0;
  const secondAvg = secondHalf.length ? secondHalf.reduce((s, a) => s + (a.overall_score || 0), 0) / secondHalf.length : 0;
  const scoreTrend = totalSongs >= 2 ? secondAvg - firstAvg : 0;

  // Chart data
  const chartData = analyses.map((a) => ({
    name: moment(a.created_date).format("MMM D"),
    title: a.title,
    "Overall Score": a.overall_score || 0,
    "Production Quality": a.production_quality || 0,
    "Hook Strength": a.hook_strength || 0,
  }));

  const recentSongs = [...analyses].reverse().slice(0, 5);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-accent";
    if (score >= 60) return "text-chart-4";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-2">Your Dashboard</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold">
            {totalSongs === 0 ? "Welcome to SoundScore" : "Your Growth Journey"}
          </h1>
          {totalSongs > 0 && (
            <p className="text-muted-foreground mt-2">
              Tracking your progress across{" "}
              <span className="text-foreground font-medium">{totalSongs} track{totalSongs !== 1 ? "s" : ""}</span>
            </p>
          )}
        </div>
        <Link to="/upload">
          <Button className="gap-2 shrink-0">
            <Upload className="h-4 w-4" />
            Analyze New Track
          </Button>
        </Link>
      </motion.div>

      {totalSongs === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-dashed border-border p-16 flex flex-col items-center text-center"
        >
          <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-5">
            <BarChart3 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-semibold mb-2">No data yet</h2>
          <p className="text-muted-foreground max-w-sm mb-6">
            Upload and analyze your first track to start tracking your algorithmic performance over time.
          </p>
          <Link to="/upload">
            <Button size="lg" className="gap-2">
              <Upload className="h-5 w-5" />
              Upload Your First Track
            </Button>
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Average Score" value={avgScore} icon={BarChart3} delay={0.05} trend={scoreTrend} color="primary" />
            <StatCard label="Tracks Analyzed" value={totalSongs} icon={Music} delay={0.1} color="accent" />
            <StatCard label="Best Score" value={bestScore} sub="Your highest result" icon={Star} delay={0.15} color="chart4" />
            <StatCard label="Avg Production" value={avgProduction} sub="Quality score" icon={Zap} delay={0.2} color="chart3" />
          </div>

          {/* Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl bg-card border border-border p-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-heading font-semibold text-xl">Performance Over Time</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Track how your scores evolve with each upload
                </p>
              </div>
              {scoreTrend !== 0 && (
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                  scoreTrend > 0 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                }`}>
                  <TrendingUp className="h-3.5 w-3.5" />
                  {scoreTrend > 0 ? "+" : ""}{scoreTrend.toFixed(1)} avg
                </div>
              )}
            </div>

            {chartData.length < 2 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Upload at least 2 tracks to see your trend chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <ReferenceLine y={70} stroke="hsl(var(--border))" strokeDasharray="4 4" label={{ value: "Good", position: "right", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Line
                    type="monotone"
                    dataKey="Overall Score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                    activeDot={{ r: 7, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Production Quality"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={{ r: 4, fill: "hsl(var(--accent))", strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Hook Strength"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={{ r: 4, fill: "hsl(var(--chart-4))", strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Recent tracks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl bg-card border border-border p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-semibold text-xl">Recent Tracks</h2>
              <Link to="/history" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentSongs.map((a, i) => (
                <Link key={a.id} to={`/song?id=${a.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Music className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.artist_name} · {moment(a.created_date).fromNow()}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-heading text-xl font-bold ${getScoreColor(a.overall_score)}`}>
                        {a.overall_score}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">score</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}