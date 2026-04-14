import { useState } from "react";
import { ChevronDown, ChevronUp, Car, Bed, Utensils, Package, Wrench, Megaphone, ParkingSquare, MoreHorizontal, ShoppingBag } from "lucide-react";
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

export default function ShowCard({ venue, expenses, merchSales }) {
  const [expanded, setExpanded] = useState(false);

  const payout = Number(venue.payout_received || 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalMerchRevenue = merchSales.reduce((s, m) => s + Number(m.total_revenue || m.quantity_sold * m.unit_price || 0), 0);
  const totalMerchCost = merchSales.reduce((s, m) => s + Number(m.total_cost || m.quantity_sold * (m.unit_cost || 0) || 0), 0);
  const netMerchProfit = totalMerchRevenue - totalMerchCost;
  const netProfit = payout + netMerchProfit - totalExpenses;

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
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Payout</p>
            <p className="font-semibold text-sm text-primary">{fmt(payout)}</p>
          </div>
          {totalMerchRevenue > 0 && (
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Merch</p>
              <p className="font-semibold text-sm text-chart-4">{fmt(netMerchProfit)}</p>
            </div>
          )}
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
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-5">
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

          {merchSales.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
                <ShoppingBag className="h-3 w-3" />Merch Sales
              </p>
              <div className="space-y-1.5">
                {merchSales.map(m => {
                  const rev = Number(m.total_revenue || m.quantity_sold * m.unit_price || 0);
                  const cost = Number(m.total_cost || m.quantity_sold * (m.unit_cost || 0) || 0);
                  return (
                    <div key={m.id} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-chart-4/10 text-chart-4 font-medium">{m.category}</span>
                        <span>{m.product_name}</span>
                        <span className="text-xs text-muted-foreground">×{m.quantity_sold}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs shrink-0">
                        <span className="text-muted-foreground">rev {fmt(rev)}</span>
                        {cost > 0 && <span className="text-destructive/70">cost {fmt(cost)}</span>}
                        <span className={`font-semibold ${(rev - cost) >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(rev - cost)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {expenses.length === 0 && merchSales.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">No data logged for this show.</p>
          )}
        </div>
      )}
    </div>
  );
}