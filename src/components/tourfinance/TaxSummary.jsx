import { FileText, Info, DollarSign, TrendingDown, AlertTriangle } from "lucide-react";

function fmt(n) {
  return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${Number(n).toFixed(2)}`;
}

function TaxLine({ label, value, sub, color = "text-foreground", bold = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0">
      <div>
        <p className={`text-sm ${bold ? "font-semibold" : ""}`}>{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <p className={`text-sm font-semibold shrink-0 ${color}`}>{value}</p>
    </div>
  );
}

export default function TaxSummary({ venues, expenses, merchSales, royalties }) {
  const showPayout = venues.reduce((s, v) => s + Number(v.payout_received || 0), 0);
  const totalMerchRevenue = merchSales.reduce((s, m) => s + Number(m.total_revenue || m.quantity_sold * m.unit_price || 0), 0);
  const totalRoyalties = royalties.reduce((s, r) => s + Number(r.total_earnings || 0), 0);
  const totalIncome = showPayout + totalMerchRevenue + totalRoyalties;

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalMerchCost = merchSales.reduce((s, m) => s + Number(m.total_cost || m.quantity_sold * (m.unit_cost || 0) || 0), 0);
  const totalDeductions = totalExpenses + totalMerchCost;

  const netTaxableIncome = totalIncome - totalDeductions;

  // SE tax = 15.3% on 92.35% of net (self-employment)
  const selfEmploymentTax = Math.max(0, netTaxableIncome * 0.9235 * 0.153);
  // Rough income tax estimate (single filer 2024 brackets, simplified)
  let incomeTax = 0;
  if (netTaxableIncome > 0) {
    const brackets = [
      [11600, 0.10], [44725, 0.12], [95375, 0.22], [201050, 0.24],
      [383900, 0.32], [487450, 0.35], [Infinity, 0.37],
    ];
    let remaining = Math.max(0, netTaxableIncome - selfEmploymentTax / 2);
    let prev = 0;
    for (const [top, rate] of brackets) {
      const slice = Math.min(remaining, top - prev);
      incomeTax += slice * rate;
      if (remaining <= top - prev) break;
      remaining -= top - prev;
      prev = top;
    }
  }
  const totalEstimatedTax = selfEmploymentTax + incomeTax;
  const quarterlyPayment = totalEstimatedTax / 4;

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-4 w-4 text-primary" />
          <p className="font-heading font-bold text-lg">Tax Preparation Summary</p>
        </div>
        <p className="text-xs text-muted-foreground">Estimates based on US self-employment tax rules. Consult a CPA for filing.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Show Payouts", value: fmt(showPayout), color: "text-primary" },
          { label: "Merch Revenue", value: fmt(totalMerchRevenue), color: "text-chart-4" },
          { label: "Streaming Royalties", value: fmt(totalRoyalties), color: "text-chart-5" },
          { label: "Total Income", value: fmt(totalIncome), color: "text-foreground", bold: true },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-secondary/40 p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`font-heading font-bold text-base ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Income & Deductions</p>
        <TaxLine label="Gross Income" value={fmt(totalIncome)} sub="Show pay + merch + royalties" color="text-primary" />
        <TaxLine label="Business Expenses" value={`- ${fmt(totalExpenses)}`} sub="Gas, lodging, food, gear, promotion" color="text-destructive" />
        <TaxLine label="Merch Production Costs" value={`- ${fmt(totalMerchCost)}`} sub="Cost of goods sold" color="text-destructive" />
        <TaxLine label="Net Taxable Income" value={fmt(netTaxableIncome)} bold color={netTaxableIncome >= 0 ? "text-foreground" : "text-destructive"} />
      </div>

      <div className="space-y-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Estimated Tax Liability</p>
        <TaxLine label="Self-Employment Tax (15.3%)" value={fmt(selfEmploymentTax)} sub="Social Security + Medicare on net earnings" color="text-chart-3" />
        <TaxLine label="Estimated Income Tax" value={fmt(incomeTax)} sub="Based on 2024 federal brackets (single filer)" color="text-chart-3" />
        <TaxLine label="Total Estimated Tax" value={fmt(totalEstimatedTax)} bold color="text-chart-3" />
        <TaxLine label="Quarterly Payment (÷ 4)" value={fmt(quarterlyPayment)} sub="Due Jan 15, Apr 15, Jun 15, Sep 15" color="text-yellow-400" bold />
      </div>

      <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4 flex gap-3">
        <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-yellow-400">Key Tax Tips for Musicians</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Keep all receipts — gas, lodging, food on tour are deductible</li>
            <li>Home studio costs may qualify as home office deduction</li>
            <li>Instrument purchases, gear, and software are deductible</li>
            <li>Pay quarterly estimated taxes to avoid underpayment penalty</li>
            <li>Consider an S-Corp election if net income exceeds $40K/year</li>
          </ul>
        </div>
      </div>
    </div>
  );
}