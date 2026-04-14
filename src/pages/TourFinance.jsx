import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, DollarSign, TrendingUp, TrendingDown, X, Check, Trash2, ChevronDown, ChevronUp, Car, Bed, Utensils, Package, Wrench, Megaphone, ParkingSquare, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

const CATEGORIES = ["Gas", "Lodging", "Food", "Merch Production", "Equipment", "Transportation", "Promotion", "Parking/Tolls", "Other"];

const CAT_ICONS = {
  Gas: Car, Lodging: Bed, Food: Utensils, "Merch Production": Package,
  Equipment: Wrench, Transportation: Car, Promotion: Megaphone,
  "Parking/Tolls": ParkingSquare, Other: MoreHorizontal,
};

const CAT_COLORS = {
  Gas: "text-orange-400 bg-orange-500/10",
  Lodging: "text-chart-5 bg-chart-5/10",
  Food: "text-green-400 bg-green-500/10",
  "Merch Production": "text-purple-400 bg-purple-500/10",
  Equipment: "text-cyan-400 bg-cyan-500/10",
  Transportation: "text-yellow-400 bg-yellow-500/10",
  Promotion: "text-pink-400 bg-pink-500/10",
  "Parking/Tolls": "text-red-400 bg-red-500/10",
  Other: "text-muted-foreground bg-secondary",
};

function fmt(n) {
  return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${Number(n).toFixed(2)}`;
}

function AddExpenseForm({ venues, onAdd, onClose }) {
  const [form, setForm] = useState({ venue_id: "", venue_name: "", show_date: "", category: "Gas", description: "", amount: "", paid_by: "", reimbursed: false });
  const set = (k) => (e) => {
    const val = e.target?.type === "checkbox" ? e.target.checked : e.target?.value ?? e;
    if (k === "venue_id") {
      const v = venues.find(x => x.id === val);
      setForm(f => ({ ...f, venue_id: val, venue_name: v?.name || "", show_date: v?.performance_date || "" }));
    } else {
      setForm(f => ({ ...f, [k]: val }));
    }
  };

  const valid = form.category && form.amount && Number(form.amount) > 0;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl bg-card border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-heading font-bold">Add Expense</p>
        <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Category *</label>
          <select value={form.category} onChange={set("category")} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Amount ($) *</label>
          <Input type="number" min="0" step="0.01" value={form.amount} onChange={set("amount")} placeholder="0.00" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Link to Venue</label>
          <select value={form.venue_id} onChange={set("venue_id")} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">No venue</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Show Date</label>
          <Input type="date" value={form.show_date} onChange={set("show_date")} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Paid By</label>
          <Input value={form.paid_by} onChange={set("paid_by")} placeholder="e.g. Alex" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Description</label>
          <Input value={form.description} onChange={set("description")} placeholder="e.g. Gas to Chicago" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="reimb" checked={form.reimbursed} onChange={set("reimbursed")} className="rounded" />
        <label htmlFor="reimb" className="text-sm text-muted-foreground">Reimbursed</label>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => valid && onAdd(form)} disabled={!valid} className="gap-2">
          <Check className="h-4 w-4" />Add Expense
        </Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </motion.div>
  );
}

function ShowCard({ venue, expenses }) {
  const [expanded, setExpanded] = useState(false);
  const payout = Number(venue.payout_received || 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const netProfit = payout - totalExpenses;
  const byCategory = CATEGORIES.reduce((acc, c) => {
    const sum = expenses.filter(e => e.category === c).reduce((s, e) => s + Number(e.amount || 0), 0);
    if (sum > 0) acc[c] = sum;
    return acc;
  }, {});

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <button className="w-full flex items-center justify-between gap-4 p-5 hover:bg-secondary/10 transition-colors text-left"
        onClick={() => setExpanded(v => !v)}>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold">{venue.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {venue.performance_date ? moment(venue.performance_date).format("MMM D, YYYY") : "No date set"}
            {venue.city && ` · ${venue.city}${venue.state ? `, ${venue.state}` : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Payout</p>
            <p className="font-semibold text-sm text-primary">{fmt(payout)}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="font-semibold text-sm text-destructive">{fmt(totalExpenses)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Net</p>
            <p className={`font-heading font-bold text-lg ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(netProfit)}</p>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
          {/* Category breakdown */}
          {Object.keys(byCategory).length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-2">Expense Breakdown</p>
              <div className="space-y-2">
                {Object.entries(byCategory).map(([cat, sum]) => {
                  const Icon = CAT_ICONS[cat] || MoreHorizontal;
                  const colorClass = CAT_COLORS[cat] || CAT_COLORS.Other;
                  const pct = totalExpenses > 0 ? (sum / totalExpenses) * 100 : 0;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-medium">{cat}</p>
                          <p className="text-xs text-muted-foreground">{fmt(sum)}</p>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Individual expenses */}
          {expenses.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-2">All Expenses</p>
              <div className="space-y-1.5">
                {expenses.map(e => (
                  <div key={e.id} className="flex items-center justify-between gap-2 text-sm py-1 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${CAT_COLORS[e.category] || CAT_COLORS.Other}`}>{e.category}</span>
                      <span className="text-muted-foreground truncate">{e.description || "—"}</span>
                      {e.paid_by && <span className="text-[10px] text-muted-foreground/60">by {e.paid_by}</span>}
                      {e.reimbursed && <span className="text-[10px] text-teal-400 font-medium">✓ reimbursed</span>}
                    </div>
                    <span className="font-medium shrink-0">{fmt(e.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expenses.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">No expenses logged for this show.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function TourFinance() {
  const [venues, setVenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Venue.filter({ status: "Performed" }, "-performance_date", 100),
      base44.entities.TourExpense.list("-created_date", 200),
    ]).then(([v, e]) => {
      setVenues(v);
      setExpenses(e);
      setLoading(false);
    });
  }, []);

  const handleAdd = async (form) => {
    const data = { ...form, amount: Number(form.amount) };
    const created = await base44.entities.TourExpense.create(data);
    setExpenses(prev => [created, ...prev]);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.TourExpense.delete(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Expenses not linked to any venue
  const unlinkedExpenses = expenses.filter(e => !e.venue_id);

  // Summary totals
  const totalPayout = venues.reduce((s, v) => s + Number(v.payout_received || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const netProfit = totalPayout - totalExpenses;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Touring</p>
            <h1 className="font-heading text-4xl font-bold">Tour Finance</h1>
            <p className="text-muted-foreground text-sm mt-1">Track expenses and net profit per show.</p>
          </div>
          <Button onClick={() => setShowForm(v => !v)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />Add Expense
          </Button>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Payouts</p>
            <p className="font-heading font-bold text-2xl text-primary">{fmt(totalPayout)}</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
            <p className="font-heading font-bold text-2xl text-destructive">{fmt(totalExpenses)}</p>
          </div>
          <div className={`rounded-2xl border p-4 text-center ${netProfit >= 0 ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"}`}>
            <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
            <div className="flex items-center justify-center gap-1.5">
              {netProfit >= 0 ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
              <p className={`font-heading font-bold text-2xl ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(netProfit)}</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <AddExpenseForm venues={venues} onAdd={handleAdd} onClose={() => setShowForm(false)} />
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {venues.length === 0 && unlinkedExpenses.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground text-sm">No performed shows yet. Mark venues as "Performed" in Venue Tracker to see them here.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Per Show</p>
                {venues.map(venue => (
                  <ShowCard key={venue.id} venue={venue} expenses={expenses.filter(e => e.venue_id === venue.id)} />
                ))}
                {unlinkedExpenses.length > 0 && (
                  <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                    <p className="font-heading font-semibold text-muted-foreground text-sm">Unlinked Expenses</p>
                    <div className="space-y-1.5">
                      {unlinkedExpenses.map(e => (
                        <div key={e.id} className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-border/50 last:border-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${CAT_COLORS[e.category] || CAT_COLORS.Other}`}>{e.category}</span>
                            <span className="text-muted-foreground truncate">{e.description || "—"}</span>
                            {e.show_date && <span className="text-[10px] text-muted-foreground/60">{moment(e.show_date).format("MMM D")}</span>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-medium">{fmt(e.amount)}</span>
                            <button onClick={() => handleDelete(e.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}