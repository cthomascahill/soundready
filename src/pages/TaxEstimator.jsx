import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { DollarSign, Calendar, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

function fmt(n) {
  return "$" + (n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toFixed(2));
}

export default function TaxEstimator() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [federalRate, setFederalRate] = useState(25); // Default 25% federal tax rate
  const [stateRate, setStateRate] = useState(6); // Default 6% state tax rate
  const [customIncome, setCustomIncome] = useState("");

  useEffect(() => {
    base44.entities.BudgetTracker.list("-created_date", 100).then((data) => {
      setBudgets(data);
      setLoading(false);
    });
  }, []);

  // Calculate total net profit
  const calculateMetrics = () => {
    const totalRevenue = budgets.reduce((sum, b) => {
      return sum + (b.revenue_streams || []).reduce((s, r) => s + (r.amount || 0), 0);
    }, 0);

    const totalExpenses = budgets.reduce((sum, b) => {
      return sum + (b.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
    }, 0);

    const netProfit = totalRevenue - totalExpenses;
    const projectedIncome = customIncome ? Number(customIncome) : netProfit;
    const federalTax = (projectedIncome * federalRate) / 100;
    const stateTax = (projectedIncome * stateRate) / 100;
    const totalTax = federalTax + stateTax;
    const quarterlyPayment = totalTax / 4;

    return { totalRevenue, totalExpenses, netProfit, projectedIncome, federalTax, stateTax, totalTax, quarterlyPayment };
  };

  const metrics = calculateMetrics();

  const quarters = [
    { name: "Q1", dueDate: "April 15", amount: metrics.quarterlyPayment },
    { name: "Q2", dueDate: "June 15", amount: metrics.quarterlyPayment },
    { name: "Q3", dueDate: "September 15", amount: metrics.quarterlyPayment },
    { name: "Q4", dueDate: "January 15 (next year)", amount: metrics.quarterlyPayment },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Financial Planning</p>
          <h1 className="font-heading text-4xl font-bold">Tax Estimator</h1>
          <p className="text-muted-foreground text-sm mt-1">Calculate quarterly estimated tax payments based on your projected income.</p>
        </motion.div>

        {/* Tax rate inputs */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <p className="font-heading font-semibold">Tax Rate Settings</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Federal Tax Rate (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={federalRate}
                onChange={(e) => setFederalRate(Number(e.target.value))}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">State Tax Rate (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={stateRate}
                onChange={(e) => setStateRate(Number(e.target.value))}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Custom Income (optional)</label>
              <Input
                type="number"
                min="0"
                value={customIncome}
                onChange={(e) => setCustomIncome(e.target.value)}
                placeholder={`Calculated: ${fmt(metrics.netProfit)}`}
                className="h-9"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Leave custom income blank to use calculated net profit from budgets</p>
        </div>

        {/* Summary cards */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-card border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
              <p className="font-heading font-bold text-lg text-primary">{fmt(metrics.totalRevenue)}</p>
            </div>
            <div className="rounded-2xl bg-card border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
              <p className="font-heading font-bold text-lg text-destructive">{fmt(metrics.totalExpenses)}</p>
            </div>
            <div className="rounded-2xl bg-card border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Net Income</p>
              <p className="font-heading font-bold text-lg text-chart-4">{fmt(metrics.netProfit)}</p>
            </div>
            <div className="rounded-2xl bg-card border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Est. Tax Obligation</p>
              <p className="font-heading font-bold text-lg text-chart-5">{fmt(metrics.totalTax)}</p>
            </div>
          </div>
        )}

        {/* Tax breakdown */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <p className="font-heading font-semibold">Tax Breakdown</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/50">
              <span className="text-sm">Projected Income</span>
              <span className="font-bold">{fmt(metrics.projectedIncome)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/50">
              <span className="text-sm">Federal Tax ({federalRate}%)</span>
              <span className="font-bold text-chart-5">{fmt(metrics.federalTax)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/50">
              <span className="text-sm">State Tax ({stateRate}%)</span>
              <span className="font-bold text-chart-5">{fmt(metrics.stateTax)}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/30">
              <span className="font-semibold">Total Estimated Tax</span>
              <span className="font-heading font-bold text-lg text-primary">{fmt(metrics.totalTax)}</span>
            </div>
          </div>
        </div>

        {/* Quarterly breakdown */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-heading font-semibold">Quarterly Estimated Payments</p>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />2026
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quarters.map((q, i) => (
              <div key={i} className="rounded-xl bg-secondary/30 border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{q.name}</p>
                  <span className="text-xs text-muted-foreground">{q.dueDate}</span>
                </div>
                <p className="font-heading font-bold text-2xl text-primary">{fmt(q.amount)}</p>
                <p className="text-xs text-muted-foreground">Due {q.dueDate}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700">These are estimates only. Consult a tax professional for accurate guidance specific to your situation.</p>
          </div>
        </div>

        {/* Info section */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" />
            <p className="font-heading font-semibold">About Estimated Taxes</p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong>Estimated taxes</strong> are quarterly payments made to federal and state tax authorities if you expect to owe $1,000 or more in taxes.
            </p>
            <p>
              As a self-employed musician or independent artist, you're typically responsible for paying estimated taxes on a quarterly basis to avoid underpayment penalties.
            </p>
            <p>
              The default rates are {federalRate}% federal and {stateRate}% state. Adjust these based on your actual tax bracket and state requirements.
            </p>
            <p>
              <strong>Note:</strong> This tool provides rough estimates. For accurate tax planning, work with a CPA or tax professional who understands music industry deductions.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}