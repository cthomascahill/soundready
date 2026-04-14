import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown, BarChart2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import PnLStatement from "@/components/budgettracker/PnLStatement";

const EXPENSE_CATEGORIES = ["Studio Time", "Music Video", "Social Ads", "Mixing & Mastering", "Photography", "Graphic Design", "PR & Marketing", "Distribution", "Other"];
const REVENUE_SOURCES = ["Spotify Streams", "Apple Music", "YouTube", "Sync Licensing", "Live Performance", "Merchandise", "TikTok Creator Fund", "Other"];

const CATEGORY_COLORS = {
  "Studio Time": "#4ade80", "Music Video": "#f472b6", "Social Ads": "#fb923c",
  "Mixing & Mastering": "#60a5fa", "Photography": "#a78bfa", "Graphic Design": "#34d399",
  "PR & Marketing": "#fbbf24", "Distribution": "#818cf8", "Other": "#94a3b8",
};

function fmt(n) {
  return "$" + (n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toFixed(2));
}

function AddRow({ categories, onAdd, placeholder = "Description" }) {
  const [cat, setCat] = useState(categories[0]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const submit = () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    onAdd({ id: crypto.randomUUID(), category: cat, description: desc, amount: parseFloat(amount), date });
    setDesc(""); setAmount("");
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-secondary/20 border border-dashed border-border">
      <select value={cat} onChange={(e) => setCat(e.target.value)}
        className="h-9 rounded-md border border-input bg-transparent px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring flex-1 min-w-[120px]">
        {categories.map((c) => <option key={c}>{c}</option>)}
      </select>
      <Input placeholder={placeholder} value={desc} onChange={(e) => setDesc(e.target.value)} className="h-9 text-xs flex-1 min-w-[120px]" />
      <Input placeholder="Amount ($)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-9 text-xs w-28" />
      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 text-xs w-36" />
      <Button size="sm" onClick={submit} className="h-9"><Plus className="h-3.5 w-3.5" /></Button>
    </div>
  );
}

export default function BudgetTracker() {
  const [records, setRecords] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newSong, setNewSong] = useState({ song_title: "", artist_name: "" });
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.BudgetTracker.list("-created_date", 20),
      base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 20),
    ]).then(([r, s]) => { setRecords(r); setSongs(s); }).finally(() => setLoading(false));
  }, []);

  const selected = records.find((r) => r.id === selectedId);

  const totals = useMemo(() => {
    if (!selected) return null;
    const expenses = (selected.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
    const revenue = (selected.revenue_streams || []).reduce((s, r) => s + (r.amount || 0), 0);
    return { expenses, revenue, roi: revenue - expenses, roiPct: expenses > 0 ? (((revenue - expenses) / expenses) * 100).toFixed(1) : "0" };
  }, [selected]);

  const pieData = useMemo(() => {
    if (!selected?.expenses?.length) return [];
    const groups = {};
    selected.expenses.forEach((e) => { groups[e.category] = (groups[e.category] || 0) + e.amount; });
    return Object.entries(groups).map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || "#94a3b8" }));
  }, [selected]);

  const barData = useMemo(() => {
    if (!selected) return [];
    return [
      { name: "Expenses", amount: totals?.expenses || 0, fill: "hsl(var(--destructive))" },
      { name: "Revenue", amount: totals?.revenue || 0, fill: "hsl(var(--primary))" },
    ];
  }, [selected, totals]);

  const updateRecord = async (patch) => {
    if (!selected) return;
    const updated = { ...selected, ...patch };
    setSaving(true);
    await base44.entities.BudgetTracker.update(selected.id, patch);
    setRecords((prev) => prev.map((r) => r.id === selected.id ? updated : r));
    setSaving(false);
  };

  const addExpense = (item) => updateRecord({ expenses: [...(selected.expenses || []), item] });
  const addRevenue = (item) => updateRecord({ revenue_streams: [...(selected.revenue_streams || []), item] });
  const removeExpense = (id) => updateRecord({ expenses: (selected.expenses || []).filter((e) => e.id !== id) });
  const removeRevenue = (id) => updateRecord({ revenue_streams: (selected.revenue_streams || []).filter((r) => r.id !== id) });

  const createBudget = async () => {
    if (!newSong.song_title) return;
    setCreating(true);
    const record = await base44.entities.BudgetTracker.create({ ...newSong, expenses: [], revenue_streams: [] });
    setRecords((prev) => [record, ...prev]);
    setSelectedId(record.id);
    setShowNew(false);
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Financial Intelligence</p>
            <h1 className="font-heading text-4xl font-bold">Budget Tracker</h1>
            <p className="text-muted-foreground">Track costs, revenue, and ROI per release.</p>
          </div>
          <Button onClick={() => setShowNew(true)} className="gap-2"><Plus className="h-4 w-4" /> New Budget</Button>
        </motion.div>

        {showNew && (
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <p className="font-heading font-bold">New Release Budget</p>
            <div className="flex gap-3 flex-wrap">
              <Input placeholder="Song title" value={newSong.song_title} onChange={(e) => setNewSong((f) => ({ ...f, song_title: e.target.value }))} className="flex-1" />
              <Input placeholder="Artist name" value={newSong.artist_name} onChange={(e) => setNewSong((f) => ({ ...f, artist_name: e.target.value }))} className="flex-1" />
            </div>
            <div className="flex gap-2">
              <Button onClick={createBudget} disabled={creating || !newSong.song_title}>{creating ? "Creating..." : "Create"}</Button>
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-2">
            {loading ? <div className="py-8 flex justify-center"><div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
              : records.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
                  <DollarSign className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">No budgets yet</p>
                </div>
              ) : records.map((r) => {
                const exp = (r.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
                const rev = (r.revenue_streams || []).reduce((s, e) => s + (e.amount || 0), 0);
                const roi = rev - exp;
                return (
                  <button key={r.id} onClick={() => setSelectedId(r.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${selectedId === r.id ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:bg-secondary/20"}`}>
                    <p className="font-medium text-sm truncate">{r.song_title}</p>
                    <p className="text-xs text-muted-foreground">{r.artist_name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-destructive">{fmt(exp)}</span>
                      <span className={`text-xs font-bold ${roi >= 0 ? "text-primary" : "text-destructive"}`}>{roi >= 0 ? "+" : ""}{fmt(roi)} ROI</span>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Detail */}
          <div className="sm:col-span-2 space-y-4">
            {!selected ? (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                <BarChart2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Select a budget to view details</p>
              </div>
            ) : (
              <>
                {/* ROI summary cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-card border border-border p-4 text-center">
                    <TrendingDown className="h-5 w-5 text-destructive mx-auto mb-1" />
                    <p className="font-heading font-bold text-xl text-destructive">{fmt(totals?.expenses || 0)}</p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                  <div className="rounded-xl bg-card border border-border p-4 text-center">
                    <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="font-heading font-bold text-xl text-primary">{fmt(totals?.revenue || 0)}</p>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                  <div className={`rounded-xl bg-card border p-4 text-center ${(totals?.roi || 0) >= 0 ? "border-primary/30" : "border-destructive/30"}`}>
                    <DollarSign className={`h-5 w-5 mx-auto mb-1 ${(totals?.roi || 0) >= 0 ? "text-primary" : "text-destructive"}`} />
                    <p className={`font-heading font-bold text-xl ${(totals?.roi || 0) >= 0 ? "text-primary" : "text-destructive"}`}>
                      {(totals?.roi || 0) >= 0 ? "+" : ""}{fmt(totals?.roi || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Net ROI ({totals?.roiPct}%)</p>
                  </div>
                </div>

                {/* Charts */}
                {(totals?.expenses > 0 || totals?.revenue > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-card border border-border p-4 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Revenue vs Expenses</p>
                      <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => "$" + (v >= 1000 ? (v / 1000).toFixed(0) + "K" : v)} width={40} />
                          <Tooltip formatter={(v) => [fmt(v), ""]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                            {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {pieData.length > 0 && (
                      <div className="rounded-xl bg-card border border-border p-4 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Expense Breakdown</p>
                        <div className="flex items-center gap-3">
                          <PieChart width={100} height={100}>
                            <Pie data={pieData} cx={50} cy={50} innerRadius={28} outerRadius={45} dataKey="value" strokeWidth={0}>
                              {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                            </Pie>
                          </PieChart>
                          <div className="space-y-1 flex-1">
                            {pieData.slice(0, 5).map((d) => (
                              <div key={d.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full" style={{ background: d.color }} /><span className="text-muted-foreground truncate max-w-[90px]">{d.name}</span></div>
                                <span className="font-medium">{fmt(d.value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* P&L Statement */}
                <PnLStatement selected={selected} totals={totals} />

                {/* Expense table */}
                <div className="rounded-xl bg-card border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="font-semibold text-sm text-destructive">Expenses</p>
                    {saving && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
                  </div>
                  <div className="divide-y divide-border">
                    {(selected.expenses || []).map((e) => (
                      <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/10 group">
                        <span className="text-xs text-muted-foreground min-w-[80px]">{e.date}</span>
                        <span className="text-xs font-medium text-destructive min-w-[120px] truncate">{e.category}</span>
                        <span className="text-sm flex-1 truncate">{e.description}</span>
                        <span className="text-sm font-bold text-destructive">{fmt(e.amount)}</span>
                        <button onClick={() => removeExpense(e.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border">
                    <AddRow categories={EXPENSE_CATEGORIES} onAdd={addExpense} placeholder="e.g. Recording session" />
                  </div>
                </div>

                {/* Revenue table */}
                <div className="rounded-xl bg-card border border-border overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-semibold text-sm text-primary">Revenue</p>
                  </div>
                  <div className="divide-y divide-border">
                    {(selected.revenue_streams || []).map((r) => (
                      <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/10 group">
                        <span className="text-xs text-muted-foreground min-w-[80px]">{r.date}</span>
                        <span className="text-xs font-medium text-primary min-w-[120px] truncate">{r.source || r.category}</span>
                        <span className="text-sm flex-1 truncate">{r.description}</span>
                        <span className="text-sm font-bold text-primary">{fmt(r.amount)}</span>
                        <button onClick={() => removeRevenue(r.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border">
                    <AddRow categories={REVENUE_SOURCES} onAdd={(item) => addRevenue({ ...item, source: item.category })} placeholder="e.g. Streaming payout" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}