import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Hotel, DollarSign, TrendingUp, TrendingDown, RefreshCw, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

function fmt(n) {
  return `$${Number(n || 0).toFixed(0)}`;
}

// Estimate nightly hotel rate using AI based on city, season, and day of week
async function estimateHotelRate(city, state, date) {
  const dayOfWeek = moment(date).format("dddd");
  const month = moment(date).format("MMMM");
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a travel cost database. Return the average nightly hotel rate for a standard 3-star hotel in ${city}, ${state || "USA"} for a stay on ${dayOfWeek}, ${month}. Consider typical seasonal pricing and weekend premiums. Return ONLY a JSON object.`,
    response_json_schema: {
      type: "object",
      properties: {
        avg_rate: { type: "number", description: "Average nightly rate in USD" },
        range_low: { type: "number" },
        range_high: { type: "number" },
        notes: { type: "string", description: "Brief 1-sentence note on pricing factors" },
      },
    },
  });
  return result;
}

export default function HotelEstimator({ travelGaps, tasks, onAddTask }) {
  const [estimates, setEstimates] = useState({}); // key: "city|date" -> { avg_rate, range_low, range_high, notes }
  const [loadingKeys, setLoadingKeys] = useState({});
  const [actuals, setActuals] = useState({}); // key: "city|date" -> actual cost from tasks
  const [expanded, setExpanded] = useState(true);

  // Build hotel night slots from travel gaps
  // For each gap, the nights between shows need hotel coverage
  const hotelNights = travelGaps.map(({ fromDate, toDate, from, to }) => {
    const nights = [];
    let d = moment(fromDate).add(1, "day");
    const end = moment(toDate);
    while (d.isBefore(end)) {
      nights.push({ date: d.format("YYYY-MM-DD"), city: to.city, state: to.state || from.state, fromCity: from.city, toCity: to.city });
      d.add(1, "day");
    }
    return nights;
  }).flat();

  // Deduplicate by date+city
  const uniqueNights = [];
  const seen = new Set();
  hotelNights.forEach(n => {
    const k = `${n.city}|${n.date}`;
    if (!seen.has(k)) { seen.add(k); uniqueNights.push(n); }
  });

  // Build actuals from existing Hotel tasks
  useEffect(() => {
    const map = {};
    tasks.filter(t => t.category === "Hotel" && t.cost).forEach(t => {
      const k = `task_${t.id}`;
      map[t.id] = t.cost;
    });
    setActuals(map);
  }, [tasks]);

  const fetchEstimate = async (night) => {
    const key = `${night.city}|${night.date}`;
    if (estimates[key] || loadingKeys[key]) return;
    setLoadingKeys(prev => ({ ...prev, [key]: true }));
    const result = await estimateHotelRate(night.city, night.state, night.date);
    setEstimates(prev => ({ ...prev, [key]: result }));
    setLoadingKeys(prev => ({ ...prev, [key]: false }));
  };

  const fetchAllEstimates = () => {
    uniqueNights.forEach(night => fetchEstimate(night));
  };

  const totalEstimated = uniqueNights.reduce((sum, n) => {
    const key = `${n.city}|${n.date}`;
    return sum + (estimates[key]?.avg_rate || 0);
  }, 0);

  const hotelTasks = tasks.filter(t => t.category === "Hotel" && t.cost);
  const totalActual = hotelTasks.reduce((s, t) => s + (t.cost || 0), 0);

  if (uniqueNights.length === 0) return null;

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-secondary/20 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-chart-5/15 border border-chart-5/30 flex items-center justify-center">
            <Hotel className="h-4 w-4 text-chart-5" />
          </div>
          <div className="text-left">
            <p className="font-heading font-bold">Hotel Cost Estimator</p>
            <p className="text-xs text-muted-foreground">{uniqueNights.length} nights across tour</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {totalEstimated > 0 && (
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Est. Total</p>
              <p className="font-heading font-bold text-chart-5">{fmt(totalEstimated)}</p>
            </div>
          )}
          {totalActual > 0 && (
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Actual Logged</p>
              <p className={`font-heading font-bold ${totalActual > totalEstimated * 1.1 ? "text-destructive" : "text-primary"}`}>{fmt(totalActual)}</p>
            </div>
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-5 space-y-4">
          {/* Summary bar */}
          {totalEstimated > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-chart-5/10 border border-chart-5/20 p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">AI Estimated</p>
                <p className="font-heading font-bold text-chart-5">{fmt(totalEstimated)}</p>
              </div>
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">Actual Logged</p>
                <p className="font-heading font-bold text-primary">{fmt(totalActual)}</p>
              </div>
              <div className={`rounded-xl p-3 text-center border ${totalActual - totalEstimated > 0 ? "bg-destructive/10 border-destructive/20" : "bg-secondary border-border"}`}>
                <p className="text-[10px] text-muted-foreground mb-0.5">Variance</p>
                <div className="flex items-center justify-center gap-1">
                  {totalActual - totalEstimated > 0 ? <TrendingUp className="h-3 w-3 text-destructive" /> : <TrendingDown className="h-3 w-3 text-primary" />}
                  <p className={`font-heading font-bold ${totalActual - totalEstimated > 0 ? "text-destructive" : "text-primary"}`}>
                    {totalActual - totalEstimated > 0 ? "+" : ""}{fmt(totalActual - totalEstimated)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nightly Breakdown</p>
            <Button size="sm" variant="outline" onClick={fetchAllEstimates} className="gap-1.5 h-7 text-xs">
              <RefreshCw className="h-3 w-3" />Fetch All Estimates
            </Button>
          </div>

          <div className="space-y-2">
            {uniqueNights.map(night => {
              const key = `${night.city}|${night.date}`;
              const est = estimates[key];
              const loading = loadingKeys[key];
              const linked = tasks.find(t => t.category === "Hotel" && t.date === night.date);

              return (
                <div key={key} className="flex items-center gap-3 rounded-xl bg-secondary/30 border border-border/50 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{night.city}</p>
                      {linked && <span className="flex items-center gap-0.5 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full"><Check className="h-2.5 w-2.5" />Logged</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{moment(night.date).format("ddd, MMM D")}</p>
                    {est?.notes && <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{est.notes}</p>}
                  </div>

                  {loading && (
                    <div className="text-xs text-muted-foreground animate-pulse">Estimating...</div>
                  )}

                  {est && !loading && (
                    <div className="text-right shrink-0">
                      <p className="font-heading font-bold text-chart-5">{fmt(est.avg_rate)}</p>
                      <p className="text-[10px] text-muted-foreground">{fmt(est.range_low)}–{fmt(est.range_high)}</p>
                    </div>
                  )}

                  {!est && !loading && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs shrink-0" onClick={() => fetchEstimate(night)}>
                      Get Estimate
                    </Button>
                  )}

                  {!linked && (
                    <Button size="sm" variant="outline" className="h-7 text-xs shrink-0 gap-1"
                      onClick={() => onAddTask({ date: night.date, category: "Hotel", title: `Hotel — ${night.city}`, cost: est?.avg_rate || "" })}>
                      <Hotel className="h-3 w-3" />Add Task
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}