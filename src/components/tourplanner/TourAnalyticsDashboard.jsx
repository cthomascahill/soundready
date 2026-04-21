import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  TrendingUp, TrendingDown, Star, DollarSign, Lightbulb, RefreshCw,
  ChevronDown, ChevronUp, MapPin, Plus, X, Check, Navigation,
  BarChart2, Target, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell
} from "recharts";
import moment from "moment";

function fmt(n) { return `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; }

const BUDGET_CATEGORIES = ["Travel", "Accommodation", "Food", "Equipment", "Promotion", "Merch", "Other"];
const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-5))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "#a78bfa", "#2dd4bf", "#fb923c"];

// ─── Budget Row ───────────────────────────────────────────────────────────────
function BudgetRow({ row, onChange, onDelete }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
      <select value={row.category} onChange={e => onChange({ ...row, category: e.target.value })}
        className="h-8 rounded-md border border-input bg-transparent px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
        {BUDGET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground w-12 text-right">Planned</span>
        <Input
          type="number" value={row.planned} placeholder="0"
          onChange={e => onChange({ ...row, planned: e.target.value })}
          className="h-8 w-24 text-xs"
        />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground w-12 text-right">Actual</span>
        <Input
          type="number" value={row.actual} placeholder="0"
          onChange={e => onChange({ ...row, actual: e.target.value })}
          className="h-8 w-24 text-xs"
        />
      </div>
      <button onClick={onDelete} className="text-muted-foreground hover:text-destructive transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function TourAnalyticsDashboard({ venues, tasks, expenses, routeData }) {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [budgetRows, setBudgetRows] = useState([
    { id: 1, category: "Travel", planned: "", actual: "" },
    { id: 2, category: "Accommodation", planned: "", actual: "" },
    { id: 3, category: "Food", planned: "", actual: "" },
  ]);
  const [suggestions, setSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // ── Per-venue analytics ──
  const venueStats = useMemo(() => {
    return venues
      .filter(v => v.performance_date)
      .sort((a, b) => a.performance_date > b.performance_date ? 1 : -1)
      .map(v => {
        const venueExpenses = expenses.filter(e => e.venue_id === v.id);
        const totalExpenses = venueExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
        const logisticsCost = tasks.filter(t => t.venue_id === v.id).reduce((s, t) => s + (t.cost || 0), 0);
        const payout = Number(v.payout_received || 0);
        let projectedRevenue = payout;
        if (!payout && v.pay_range) {
          const matches = v.pay_range.match(/\d+/g);
          if (matches) {
            const nums = matches.map(Number);
            projectedRevenue = nums.reduce((a, b) => a + b, 0) / nums.length;
          }
        }
        if (v.door_deal && v.capacity) {
          const ticketRevenue = Math.round(v.capacity * 0.6 * 20);
          projectedRevenue = Math.max(projectedRevenue, ticketRevenue);
        }
        const totalCost = totalExpenses + logisticsCost;
        return {
          id: v.id, name: v.name, city: v.city, state: v.state,
          date: v.performance_date, capacity: v.capacity, status: v.status,
          payout, projectedRevenue, totalCost,
          netProjected: projectedRevenue - totalCost,
          rating: v.rating || 0, payRange: v.pay_range,
        };
      });
  }, [venues, tasks, expenses]);

  // ── Total driving miles from routeData ──
  const totalMiles = useMemo(() => {
    return Object.values(routeData || {}).reduce((s, r) => s + (r?.distanceMiles || 0), 0);
  }, [routeData]);

  const tourDays = useMemo(() => {
    if (venueStats.length < 2) return 0;
    return moment(venueStats[venueStats.length - 1].date).diff(moment(venueStats[0].date), "days") + 1;
  }, [venueStats]);

  const totalProjected = venueStats.reduce((s, v) => s + v.projectedRevenue, 0);
  const totalCosts = venueStats.reduce((s, v) => s + v.totalCost, 0);
  const netTotal = totalProjected - totalCosts;

  // ── Budget totals ──
  const budgetTotals = useMemo(() => {
    const totalPlanned = budgetRows.reduce((s, r) => s + Number(r.planned || 0), 0);
    const totalActual = budgetRows.reduce((s, r) => s + Number(r.actual || 0), 0);
    return { totalPlanned, totalActual, variance: totalActual - totalPlanned };
  }, [budgetRows]);

  // ── Key metrics ──
  const costPerMile = totalMiles > 0 ? (budgetTotals.totalActual || totalCosts) / totalMiles : 0;
  const costPerDay = tourDays > 0 ? (budgetTotals.totalActual || totalCosts) / tourDays : 0;
  const revenuePerShow = venueStats.length > 0 ? totalProjected / venueStats.length : 0;

  // ── Chart data ──
  const revenueVsCostData = venueStats.slice(0, 8).map(v => ({
    name: v.city || v.name.substring(0, 10),
    Revenue: Math.round(v.projectedRevenue),
    Costs: Math.round(v.totalCost),
    Net: Math.round(v.netProjected),
  }));

  const budgetComparisonData = budgetRows
    .filter(r => r.planned || r.actual)
    .map(r => ({
      name: r.category,
      Planned: Number(r.planned || 0),
      Actual: Number(r.actual || 0),
    }));

  const budgetPieData = budgetRows
    .filter(r => Number(r.actual || 0) > 0)
    .map(r => ({ name: r.category, value: Number(r.actual) }));

  // ── Timeline (cumulative revenue) ──
  const timelineData = useMemo(() => {
    let cumRevenue = 0;
    let cumCost = 0;
    return venueStats.map(v => {
      cumRevenue += v.projectedRevenue;
      cumCost += v.totalCost;
      return {
        date: moment(v.date).format("MMM D"),
        "Cum. Revenue": Math.round(cumRevenue),
        "Cum. Cost": Math.round(cumCost),
      };
    });
  }, [venueStats]);

  // ── AI projections ──
  const fetchSuggestions = async () => {
    if (venueStats.length === 0) return;
    setLoadingSuggestions(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a music tour financial advisor. Based on the following tour data, provide:
1. AI-driven cost projections for a similar future tour
2. 3 specific actionable suggestions to improve profitability
3. A brief overall summary

Tour data:
- Shows: ${venueStats.length}
- Duration: ${tourDays} days
- Total miles: ${Math.round(totalMiles)} mi
- Projected revenue: $${Math.round(totalProjected)}
- Total costs: $${Math.round(budgetTotals.totalActual || totalCosts)}
- Cost/mile: $${costPerMile.toFixed(2)}
- Cost/day: $${costPerDay.toFixed(2)}
- Revenue/show: $${Math.round(revenuePerShow)}
- Venues: ${JSON.stringify(venueStats.map(v => ({ city: v.city, revenue: v.projectedRevenue, cost: v.totalCost, capacity: v.capacity })))}
- Budget breakdown: ${JSON.stringify(budgetRows.filter(r => r.planned || r.actual))}`,
      response_json_schema: {
        type: "object",
        properties: {
          future_projection: {
            type: "object",
            properties: {
              estimated_revenue: { type: "number" },
              estimated_costs: { type: "number" },
              cost_breakdown: {
                type: "object",
                properties: {
                  travel: { type: "number" },
                  accommodation: { type: "number" },
                  food: { type: "number" },
                  other: { type: "number" },
                }
              },
              notes: { type: "string" }
            }
          },
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                detail: { type: "string" },
                impact: { type: "string", enum: ["High", "Medium", "Low"] },
                estimated_savings: { type: "number" },
              }
            }
          },
          summary: { type: "string" },
        }
      }
    });
    setSuggestions(result);
    setLoadingSuggestions(false);
  };

  if (venues.length === 0) return null;

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "budget", label: "Budget" },
    { id: "metrics", label: "Metrics" },
    { id: "ai", label: "AI Projections" },
  ];

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-secondary/20 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <BarChart2 className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-heading font-bold">Tour Analytics & Budget</p>
            <p className="text-xs text-muted-foreground">Revenue · Costs · Projections · Budget tracking</p>
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
        <div className="border-t border-border">
          {/* Tabs */}
          <div className="flex border-b border-border px-5 gap-1 pt-3">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
                  activeTab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-5">
            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <>
                {/* KPI row */}
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

                {/* Revenue vs Costs chart */}
                {revenueVsCostData.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Revenue vs Costs per Venue</p>
                    <ResponsiveContainer width="100%" height={170}>
                      <BarChart data={revenueVsCostData} barSize={12} barGap={2}>
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v > 999 ? (v / 1000).toFixed(0) + "k" : v}`} />
                        <Tooltip formatter={(v, n) => [fmt(v), n]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="Revenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Costs" fill="hsl(var(--destructive))" opacity={0.7} radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Cumulative timeline */}
                {timelineData.length > 1 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cumulative Revenue vs Cost</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v > 999 ? (v / 1000).toFixed(0) + "k" : v}`} />
                        <Tooltip formatter={(v, n) => [fmt(v), n]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="Cum. Revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Cum. Cost" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Venue ranking */}
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
              </>
            )}

            {/* ── BUDGET TAB ── */}
            {activeTab === "budget" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Planned vs Actual Budget</p>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                    onClick={() => setBudgetRows(prev => [...prev, { id: Date.now(), category: "Travel", planned: "", actual: "" }])}>
                    <Plus className="h-3 w-3" />Add Row
                  </Button>
                </div>

                <div className="space-y-2">
                  {budgetRows.map(row => (
                    <BudgetRow key={row.id} row={row}
                      onChange={updated => setBudgetRows(prev => prev.map(r => r.id === row.id ? updated : r))}
                      onDelete={() => setBudgetRows(prev => prev.filter(r => r.id !== row.id))}
                    />
                  ))}
                </div>

                {/* Totals */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                  <div className="rounded-xl bg-secondary/50 border border-border p-3 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Total Planned</p>
                    <p className="font-heading font-bold text-foreground">{fmt(budgetTotals.totalPlanned)}</p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 border border-border p-3 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Total Actual</p>
                    <p className="font-heading font-bold text-foreground">{fmt(budgetTotals.totalActual)}</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center border ${budgetTotals.variance <= 0 ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"}`}>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Variance</p>
                    <p className={`font-heading font-bold ${budgetTotals.variance <= 0 ? "text-primary" : "text-destructive"}`}>
                      {budgetTotals.variance > 0 ? "+" : ""}{fmt(budgetTotals.variance)}
                    </p>
                  </div>
                </div>

                {/* Planned vs Actual bar chart */}
                {budgetComparisonData.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Planned vs Actual by Category</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={budgetComparisonData} barSize={14} barGap={2}>
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v > 999 ? (v / 1000).toFixed(0) + "k" : v}`} />
                        <Tooltip formatter={(v, n) => [fmt(v), n]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="Planned" fill="hsl(var(--chart-5))" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Actual" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Spending breakdown pie */}
                {budgetPieData.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Actual Spend Breakdown</p>
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width={140} height={140}>
                        <PieChart>
                          <Pie data={budgetPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                            {budgetPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v) => [fmt(v)]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1.5 flex-1">
                        {budgetPieData.map((d, i) => (
                          <div key={d.name} className="flex items-center gap-2 text-xs">
                            <div className="h-2 w-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="flex-1 text-muted-foreground">{d.name}</span>
                            <span className="font-medium">{fmt(d.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── METRICS TAB ── */}
            {activeTab === "metrics" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Cost per Mile", value: totalMiles > 0 ? `$${costPerMile.toFixed(2)}` : "—", sub: `${Math.round(totalMiles)} total miles`, icon: Navigation, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                    { label: "Cost per Day", value: tourDays > 0 ? fmt(costPerDay) : "—", sub: `${tourDays} tour days`, icon: DollarSign, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
                    { label: "Revenue per Show", value: fmt(revenuePerShow), sub: `${venueStats.length} shows`, icon: Zap, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
                    { label: "Avg Capacity", value: venueStats.filter(v => v.capacity).length > 0 ? Math.round(venueStats.filter(v => v.capacity).reduce((s, v) => s + v.capacity, 0) / venueStats.filter(v => v.capacity).length) : "—", sub: "seats per venue", icon: Target, color: "text-chart-5", bg: "bg-chart-5/10", border: "border-chart-5/20" },
                    { label: "Budget Variance", value: fmt(Math.abs(budgetTotals.variance)), sub: budgetTotals.variance <= 0 ? "under budget ✓" : "over budget ✗", icon: TrendingUp, color: budgetTotals.variance <= 0 ? "text-primary" : "text-destructive", bg: budgetTotals.variance <= 0 ? "bg-primary/10" : "bg-destructive/10", border: budgetTotals.variance <= 0 ? "border-primary/20" : "border-destructive/20" },
                    { label: "Margin", value: totalProjected > 0 ? `${Math.round((netTotal / totalProjected) * 100)}%` : "—", sub: "net margin", icon: TrendingUp, color: netTotal >= 0 ? "text-primary" : "text-destructive", bg: netTotal >= 0 ? "bg-primary/10" : "bg-destructive/10", border: netTotal >= 0 ? "border-primary/20" : "border-destructive/20" },
                  ].map(m => {
                    const Icon = m.icon;
                    return (
                      <div key={m.label} className={`rounded-xl border p-3 ${m.bg} ${m.border}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`h-3.5 w-3.5 shrink-0 ${m.color}`} />
                          <p className="text-[10px] text-muted-foreground">{m.label}</p>
                        </div>
                        <p className={`font-heading font-bold text-lg ${m.color}`}>{m.value}</p>
                        <p className="text-[10px] text-muted-foreground">{m.sub}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Net per show chart */}
                {venueStats.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Net Profit per Show</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={venueStats.map(v => ({ name: v.city || v.name.substring(0, 10), Net: Math.round(v.netProjected) }))}>
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v > 999 ? (v / 1000).toFixed(0) + "k" : v}`} />
                        <Tooltip formatter={(v) => [fmt(v), "Net"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                        <Bar dataKey="Net" radius={[3, 3, 0, 0]}>
                          {venueStats.map((v, i) => <Cell key={i} fill={v.netProjected >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))"} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* ── AI PROJECTIONS TAB ── */}
            {activeTab === "ai" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2"><Lightbulb className="h-4 w-4 text-yellow-400" />AI Cost Projections</p>
                    <p className="text-xs text-muted-foreground mt-0.5">AI analyzes your tour data to project costs and suggest optimizations for future tours.</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={fetchSuggestions} disabled={loadingSuggestions} className="gap-1.5 h-8 text-xs shrink-0">
                    {loadingSuggestions ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    {suggestions ? "Refresh" : "Analyze"}
                  </Button>
                </div>

                {loadingSuggestions && (
                  <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />Analyzing your tour data...
                  </div>
                )}

                {!suggestions && !loadingSuggestions && (
                  <div className="rounded-xl bg-secondary/30 border border-border p-6 text-center space-y-2">
                    <Lightbulb className="h-8 w-8 text-yellow-400/50 mx-auto" />
                    <p className="text-xs text-muted-foreground">Click "Analyze" to get AI-powered cost projections and profitability suggestions based on your tour data.</p>
                  </div>
                )}

                {suggestions && (
                  <div className="space-y-4">
                    {suggestions.summary && (
                      <div className="rounded-xl bg-secondary/40 border border-border px-4 py-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">{suggestions.summary}</p>
                      </div>
                    )}

                    {/* Future projection */}
                    {suggestions.future_projection && (
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-3">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider">Future Tour Projection</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Est. Revenue</p>
                            <p className="font-heading font-bold text-primary">{fmt(suggestions.future_projection.estimated_revenue)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Est. Costs</p>
                            <p className="font-heading font-bold text-destructive">{fmt(suggestions.future_projection.estimated_costs)}</p>
                          </div>
                        </div>
                        {suggestions.future_projection.cost_breakdown && (
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(suggestions.future_projection.cost_breakdown).map(([k, v]) => (
                              <div key={k} className="flex justify-between text-xs bg-secondary/40 rounded-lg px-2 py-1">
                                <span className="text-muted-foreground capitalize">{k}</span>
                                <span className="font-medium">{fmt(v)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {suggestions.future_projection.notes && (
                          <p className="text-[10px] text-muted-foreground italic">{suggestions.future_projection.notes}</p>
                        )}
                      </div>
                    )}

                    {/* Suggestions */}
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
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{s.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
                            {s.estimated_savings > 0 && (
                              <p className="text-xs text-primary font-medium mt-1">Est. savings: {fmt(s.estimated_savings)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}