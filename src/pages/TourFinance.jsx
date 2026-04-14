import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, DollarSign, TrendingUp, TrendingDown, X, Check, Trash2, ShoppingBag, Map, MapPin, BarChart2, FileText, Car, Bed, Utensils, Package, Wrench, Megaphone, ParkingSquare, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";
import ShowCard from "@/components/tourfinance/ShowCard";
import TaxSummary from "@/components/tourfinance/TaxSummary";
import TourMapView from "@/components/tourfinance/TourMapView";
import AddMerchSaleForm from "@/components/tourfinance/AddMerchSaleForm";
import BudgetForecast from "@/components/tourfinance/BudgetForecast";

const CATEGORIES = ["Gas", "Lodging", "Food", "Merch Production", "Equipment", "Transportation", "Promotion", "Parking/Tolls", "Other"];

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
        <Button onClick={() => valid && onAdd(form)} disabled={!valid} className="gap-2"><Check className="h-4 w-4" />Add Expense</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </motion.div>
  );
}

const TABS = [
  { id: "shows", label: "Shows", icon: BarChart2 },
  { id: "map", label: "Map", icon: Map },
  { id: "tax", label: "Tax Summary", icon: FileText },
];

export default function TourFinance() {
  const [venues, setVenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [merchSales, setMerchSales] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [royalties, setRoyalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showMerchForm, setShowMerchForm] = useState(false);
  const [activeTab, setActiveTab] = useState("shows");

  useEffect(() => {
    Promise.all([
      base44.entities.Venue.filter({ status: "Performed" }, "-performance_date", 100),
      base44.entities.TourExpense.list("-created_date", 200),
      base44.entities.MerchSale.list("-created_date", 200),
      base44.entities.TourRoute.list("-created_date", 50),
      base44.entities.RoyaltyStatement.list("-created_date", 100),
    ]).then(([v, e, m, r, royals]) => {
      setVenues(v);
      setExpenses(e);
      setMerchSales(m);
      setRoutes(r);
      setRoyalties(royals);
      setLoading(false);
    });
  }, []);

  const handleAddExpense = async (form) => {
    const created = await base44.entities.TourExpense.create({ ...form, amount: Number(form.amount) });
    setExpenses(prev => [created, ...prev]);
    setShowExpenseForm(false);
  };

  const handleAddMerch = async (data) => {
    const created = await base44.entities.MerchSale.create(data);
    setMerchSales(prev => [created, ...prev]);
    setShowMerchForm(false);
  };

  const handleDeleteExpense = async (id) => {
    await base44.entities.TourExpense.delete(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const unlinkedExpenses = expenses.filter(e => !e.venue_id);

  // Summary totals (merch cost included as negative)
  const totalPayout = venues.reduce((s, v) => s + Number(v.payout_received || 0), 0);
  const totalMerchRevenue = merchSales.reduce((s, m) => s + Number(m.total_revenue || m.quantity_sold * m.unit_price || 0), 0);
  const totalMerchCost = merchSales.reduce((s, m) => s + Number(m.total_cost || m.quantity_sold * (m.unit_cost || 0) || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const netProfit = totalPayout + (totalMerchRevenue - totalMerchCost) - totalExpenses;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Touring</p>
            <h1 className="font-heading text-4xl font-bold">Tour Finance</h1>
            <p className="text-muted-foreground text-sm mt-1">Track expenses, merch, and net profit per show.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => window.location.href = "/venues"} className="gap-2">
              <MapPin className="h-4 w-4" />Manage Venues
            </Button>
            <Button variant="outline" onClick={() => { setShowMerchForm(v => !v); setShowExpenseForm(false); }} className="gap-2">
              <ShoppingBag className="h-4 w-4" />Merch Sale
            </Button>
            <Button onClick={() => { setShowExpenseForm(v => !v); setShowMerchForm(false); }} className="gap-2">
              <Plus className="h-4 w-4" />Add Expense
            </Button>
          </div>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Show Payouts</p>
            <p className="font-heading font-bold text-xl text-primary">{fmt(totalPayout)}</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Merch Net</p>
            <p className="font-heading font-bold text-xl text-chart-4">{fmt(totalMerchRevenue - totalMerchCost)}</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
            <p className="font-heading font-bold text-xl text-destructive">{fmt(totalExpenses)}</p>
          </div>
          <div className={`rounded-2xl border p-4 text-center ${netProfit >= 0 ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"}`}>
            <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
            <div className="flex items-center justify-center gap-1">
              {netProfit >= 0 ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
              <p className={`font-heading font-bold text-xl ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(netProfit)}</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showExpenseForm && <AddExpenseForm venues={venues} onAdd={handleAddExpense} onClose={() => setShowExpenseForm(false)} />}
          {showMerchForm && <AddMerchSaleForm venues={venues} onAdd={handleAddMerch} onClose={() => setShowMerchForm(false)} />}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary/40 rounded-xl p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeTab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span>
            </button>
          ))}
          <button onClick={() => setActiveTab("forecast")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "forecast" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <TrendingDown className="h-4 w-4" /><span className="hidden sm:inline">Forecast</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === "shows" && (
              <div className="space-y-4">
                {venues.length === 0 && unlinkedExpenses.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                    <p className="text-muted-foreground text-sm">No performed shows yet. Mark venues as "Performed" in Venue Tracker.</p>
                  </div>
                ) : (
                  <>
                    {venues.length > 0 && (
                      <>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Per Show</p>
                        {venues.map(venue => (
                          <ShowCard key={venue.id} venue={venue}
                            expenses={expenses.filter(e => e.venue_id === venue.id)}
                            merchSales={merchSales.filter(m => m.venue_id === venue.id)} />
                        ))}
                      </>
                    )}
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
                                <button onClick={() => handleDeleteExpense(e.id)} className="text-muted-foreground hover:text-destructive transition-colors">
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

            {activeTab === "map" && (
              <TourMapView venues={venues} expenses={expenses} merchSales={merchSales} routes={routes} />
            )}

            {activeTab === "tax" && (
              <TaxSummary venues={venues} expenses={expenses} merchSales={merchSales} royalties={royalties} />
            )}

            {activeTab === "forecast" && (
              <BudgetForecast venues={venues} expenses={expenses} routeData={{}} />
            )}
          </>
        )}
      </div>
    </div>
  );
}