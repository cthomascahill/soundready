import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, Star, DollarSign, Lightbulb, RefreshCw, ChevronDown, ChevronUp, Mic2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import moment from "moment";

function fmt(n) {
  return `$${Number(n || 0).toFixed(0)}`;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-5))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function TourAnalyticsDashboard({ venues, tasks, expenses, routeData }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Per-venue analytics: project ticket revenue from capacity + pay_range + payout
  const venueStats = useMemo(() => {
    return venues
      .filter(v => v.performance_date)
      .sort((a, b) => a.performance_date > b.performance_date ? 1 : -1)
      .map(v => {
        const venueExpenses = expenses.filter(e => e.venue_id === v.id);
        const totalExpenses = venueExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
        const hotelTasks = tasks.filter(t => t.venue_id === v.id && t.category === "Hotel");
        const hotelCost = hotelTasks.reduce((s, t) => s + (t.cost || 0), 0);
        const logisticsCost = tasks.filter(t => t.venue_id === v.id).reduce((s, t) => s + (t.cost || 0), 0);

        // Parse pay range for projection
        const payout = Number(v.payout_received || 0);
        let projectedRevenue = payout;
        if (!payout && v.pay_range) {
          const matches = v.pay_range.match(/\d+/g);
          if (matches) {
            const nums = matches.map(Number);
            projectedRevenue = nums.reduce((a, b) => a + b, 0) / nums.length;
          }
        }
        // Simple ticket projection: assume 60% of capacity at $20/ticket avg if door deal
        if (v.door_deal && v.capacity) {
          const ticketRevenue = Math.round(v.capacity * 0.6 * 20);
          projectedRevenue = Math.max(projectedRevenue, ticketRevenue);
        }

        const totalCost = totalExpenses + logisticsCost;
        const netProjected = projectedRevenue - totalCost;

        return {
          id: v.id,
          name: v.name,
          city: v.city,
          state: v.state,
          date: v.performance_date,
          capacity: v.capacity,
          status: v.status,
          payout: payout,
          projectedRevenue,
          totalCost,
          netProjected,
          rating: v.rating || 0,
          payRange: v.pay_range,
        };
      });
  }, [venues, tasks, expenses]);

  const chartData = venueStats.slice(0, 8).map(v => ({
    name: v.city || v.name.substring(0, 10),
    Revenue: Math.round(v.projectedRevenue),
    Costs: Math.round(v.totalCost),
  }));

  const totalProjected = venueStats.reduce((s, v) => s + v.projectedRevenue, 0);
  const totalCosts = venueStats.reduce((s, v) => s + v.totalCost, 0);
  const netTotal = totalProjected - totalCosts;

  const topVenue = venueStats.length > 0
    ? venueStats.reduce((best, v) => v.netProjected > best.netProjected ? v : best, venueStats[0])
    : null;

  const fetchSuggestions = async () => {
    if (venueStats.length === 0) return;
    setLoadingSuggestions(true);
    const data = venueStats.map(v => ({
      venue: v.name,
      city: v.city,
      date: v.date,
      projected_revenue: v.projectedRevenue,
      total_costs: v.totalCost,
      net: v.netProjected,
      capacity: v.capacity,
      rating: v.rating,
    }));
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a music tour booking advisor. Analyze this venue data and provide 3 specific, actionable suggestions to maximize tour profitability. Be concise and practical. Data: ${JSON.stringify(data)}`,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                detail: { type: "string" },
                impact: { type: "string", enum: ["High", "Medium", "Low"] },
              },
            },
          },
          best_venue: { type: "string" },
          worst_venue: { type: "string" },
          summary: { type: "string" },
        },
      },
    });
    setSuggestions(result);
    setLoadingSuggestions(false);
  };

  if (venues.length === 0) return null;

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-secondary/20 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-heading font-bold">Tour Analytics</p>
            <p className="text-xs text-muted-foreground">Revenue vs costs · Venue profitability</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Projected Net</p>
            <p className={`font-heading font-bold ${netTotal >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(netTotal)}</p>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-5 space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Total Revenue</p>
              <p className="font-heading font-bold text-primary">{fmt(totalProjected)}</p>
            </div>
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Total Costs</p>
              <p className="font-heading font-bold text-destructive">{fmt(totalCosts)}</p>
            </div>
            <div className={`rounded-xl p-3 text-center border ${netTotal >= 0 ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"}`}>
              <p className="text-[10px] text-muted-foreground mb-0.5">Net</p>
              <div className="flex items-center justify-center gap-1">
                {netTotal >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-primary" /> : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                <p className={`font-heading font-bold ${netTotal >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(netTotal)}</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Revenue vs Costs per Venue</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barSize={14} barGap={2}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v > 999 ? (v/1000).toFixed(0)+"k" : v}`} />
                  <Tooltip formatter={(v, n) => [fmt(v), n]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="Revenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Costs" fill="hsl(var(--destructive))" opacity={0.7} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Per-venue table */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Venue Profitability Ranking</p>
            <div className="space-y-1.5">
              {[...venueStats].sort((a, b) => b.netProjected - a.netProjected).map((v, i) => (
                <div key={v.id} className={`flex items-center gap-3 rounded-xl p-2.5 border text-sm ${
                  i === 0 ? "bg-primary/5 border-primary/20" : "bg-secondary/20 border-border/50"
                }`}>
                  <span className={`text-xs font-bold w-5 text-center ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{i + 1}</span>
                  {i === 0 && <Star className="h-3.5 w-3.5 text-yellow-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{v.name}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5" />{v.city}{v.state ? `, ${v.state}` : ""} · {moment(v.date).format("MMM D")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">Rev: {fmt(v.projectedRevenue)} / Cost: {fmt(v.totalCost)}</p>
                    <p className={`font-heading font-bold text-sm ${v.netProjected >= 0 ? "text-primary" : "text-destructive"}`}>
                      {v.netProjected >= 0 ? "+" : ""}{fmt(v.netProjected)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />AI Venue Suggestions
              </p>
              <Button size="sm" variant="outline" onClick={fetchSuggestions} disabled={loadingSuggestions} className="gap-1.5 h-7 text-xs">
                {loadingSuggestions ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                {suggestions ? "Refresh" : "Analyze"}
              </Button>
            </div>
            {suggestions && (
              <div className="space-y-2">
                {suggestions.summary && (
                  <p className="text-xs text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2">{suggestions.summary}</p>
                )}
                {suggestions.suggestions?.map((s, i) => (
                  <div key={i} className={`rounded-xl p-3 border ${
                    s.impact === "High" ? "bg-primary/5 border-primary/20" :
                    s.impact === "Medium" ? "bg-yellow-500/5 border-yellow-500/20" :
                    "bg-secondary/20 border-border/50"
                  }`}>
                    <div className="flex items-start gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 ${
                        s.impact === "High" ? "bg-primary/20 text-primary" :
                        s.impact === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-secondary text-muted-foreground"
                      }`}>{s.impact}</span>
                      <div>
                        <p className="text-sm font-semibold">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!suggestions && !loadingSuggestions && (
              <p className="text-xs text-muted-foreground text-center py-3">Click "Analyze" to get AI-powered venue profitability suggestions.</p>
            )}
            {loadingSuggestions && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />Analyzing venue data...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}