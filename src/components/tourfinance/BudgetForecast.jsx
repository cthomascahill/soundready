import { useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingDown, AlertCircle, DollarSign } from "lucide-react";
import moment from "moment";

export default function BudgetForecast({ venues, expenses, routeData }) {
  const forecast = useMemo(() => {
    if (!venues.length || !expenses.length) return null;

    // Calculate historical averages
    const historicalExpenses = expenses.filter(e => e.show_date);
    const venuesByDate = {};
    venues.forEach(v => {
      if (v.performance_date) {
        const date = moment(v.performance_date).format("YYYY-MM-DD");
        venuesByDate[date] = v;
      }
    });

    // Group expenses by show
    const expensesByShow = {};
    historicalExpenses.forEach(e => {
      if (e.venue_id) {
        if (!expensesByShow[e.venue_id]) expensesByShow[e.venue_id] = [];
        expensesByShow[e.venue_id].push(e);
      }
    });

    // Calculate avg cost per show and per category
    let totalShowCost = 0;
    let showCount = 0;
    const costByCategory = {};

    Object.values(expensesByShow).forEach(items => {
      const showTotal = items.reduce((s, e) => s + (e.amount || 0), 0);
      totalShowCost += showTotal;
      showCount++;
      items.forEach(e => {
        if (!costByCategory[e.category]) costByCategory[e.category] = { total: 0, count: 0 };
        costByCategory[e.category].total += e.amount || 0;
        costByCategory[e.category].count += 1;
      });
    });

    const avgCostPerShow = showCount > 0 ? totalShowCost / showCount : 0;

    // Calculate distance-based costs
    const sortedShows = Object.entries(venuesByDate)
      .sort((a, b) => moment(a[0]).diff(moment(b[0])))
      .map(([date, v]) => ({ date, venue: v }));

    let totalDistance = 0;
    for (let i = 1; i < sortedShows.length; i++) {
      const prev = sortedShows[i - 1].venue;
      const curr = sortedShows[i].venue;
      const key = `${prev.city},${prev.state}|${curr.city},${curr.state}`;
      if (routeData[key]) {
        totalDistance += routeData[key].distanceMiles || 0;
      }
    }

    const projectedCosts = sortedShows.map((show, idx) => {
      const baseCost = avgCostPerShow;
      let travelCost = 0;

      if (idx > 0 && idx < sortedShows.length) {
        const prev = sortedShows[idx - 1].venue;
        const curr = show.venue;
        const key = `${prev.city},${prev.state}|${curr.city},${curr.state}`;
        const route = routeData[key];
        if (route) {
          const milesThisLeg = route.distanceMiles || 0;
          const gasPerMile = 0.15; // $0.15 per mile average
          travelCost = milesThisLeg * gasPerMile;
        }
      }

      const actualExpenses = (expensesByShow[show.venue.id] || []).reduce((s, e) => s + (e.amount || 0), 0);

      return {
        venue: show.venue.name.substring(0, 15),
        city: show.venue.city,
        projected: Math.round(baseCost + travelCost),
        actual: actualExpenses > 0 ? actualExpenses : null,
        date: moment(show.date).format("MMM D"),
      };
    });

    return {
      avgCostPerShow: Math.round(avgCostPerShow),
      totalDistance,
      projectedCosts,
      costByCategory,
    };
  }, [venues, expenses, routeData]);

  if (!forecast) {
    return (
      <div className="rounded-2xl bg-card border border-border p-8 text-center">
        <TrendingDown className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">Not enough data for forecast (need historical expenses).</p>
      </div>
    );
  }

  const totalProjected = forecast.projectedCosts.reduce((s, x) => s + x.projected, 0);
  const totalActual = forecast.projectedCosts.reduce((s, x) => s + (x.actual || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-card border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Avg Cost/Show</p>
          <p className="font-heading font-bold text-xl text-primary">${forecast.avgCostPerShow}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Tour Distance</p>
          <p className="font-heading font-bold text-xl text-chart-5">{forecast.totalDistance.toLocaleString()} mi</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Projected vs Actual</p>
          <p className={`font-heading font-bold text-xl ${totalActual > totalProjected ? "text-destructive" : "text-primary"}`}>
            ${totalProjected} vs ${totalActual}
          </p>
        </div>
      </div>

      {/* Forecast chart */}
      {forecast.projectedCosts.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Projected vs Actual Spending</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={forecast.projectedCosts} margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
              <XAxis dataKey="venue" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [v ? `$${v}` : "—", ""]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend />
              <Bar dataKey="projected" fill="hsl(var(--chart-5))" opacity={0.8} radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Warnings */}
      {forecast.projectedCosts.some(x => x.actual && x.actual > x.projected * 1.2) && (
        <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-4 space-y-2">
          <p className="text-xs font-semibold text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />Budget Overruns Detected
          </p>
          {forecast.projectedCosts
            .filter(x => x.actual && x.actual > x.projected * 1.2)
            .map(x => (
              <p key={x.venue} className="text-xs text-red-300">
                {x.venue} ({x.city}): {Math.round(((x.actual - x.projected) / x.projected) * 100)}% over budget
              </p>
            ))}
        </div>
      )}
    </div>
  );
}