import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import moment from "moment";
import { Map, Mic2, ChevronRight, Calendar, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt, computeTotals, scopeTourData } from "@/lib/tourFinance";

const STATUS_STYLES = {
  Planning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25",
  Active: "bg-primary/10 text-primary border-primary/25",
  Completed: "bg-secondary text-muted-foreground border-border",
};

function TourFinanceCard({ tour, data }) {
  const totals = computeTotals(data);
  const revenue = totals.totalPayout + (totals.totalMerchRevenue - totals.totalMerchCost) + totals.totalTicketRevenue;
  const performed = data.tourVenues.filter(v => v.status === "Performed").length;
  const dates = data.tourVenues.map(v => v.performance_date).filter(Boolean).sort();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading font-bold text-lg truncate">{tour.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
            <Calendar className="h-3 w-3" />
            {dates.length
              ? `${moment(dates[0]).format("MMM D, YYYY")}${dates.length > 1 ? ` – ${moment(dates[dates.length - 1]).format("MMM D, YYYY")}` : ""}`
              : "No shows yet"}
          </p>
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[tour.status] || STATUS_STYLES.Planning}`}>
          {tour.status || "Planning"}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Mic2 className="h-3 w-3" />{data.tourVenues.length} show{data.tourVenues.length === 1 ? "" : "s"} · {performed} performed</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-secondary/50 p-2.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Revenue</p>
          <p className="text-sm font-bold text-green-600">{fmt(revenue)}</p>
        </div>
        <div className="rounded-xl bg-secondary/50 p-2.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Expenses</p>
          <p className="text-sm font-bold text-destructive">{fmt(totals.totalExpenses)}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${totals.netProfit >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Net</p>
          <p className={`text-sm font-bold ${totals.netProfit >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(totals.netProfit)}</p>
        </div>
      </div>

      <Button asChild size="sm" className="gap-1.5 mt-auto">
        <Link to={`/tour-finance/${tour.id}`}>Open Finances <ChevronRight className="h-3.5 w-3.5" /></Link>
      </Button>
    </motion.div>
  );
}

export default function TourFinance() {
  const [tours, setTours] = useState([]);
  const [all, setAll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.TourRoute.list("-created_date", 100),
      base44.entities.Venue.list("-created_date", 500),
      base44.entities.TourExpense.list("-created_date", 200),
      base44.entities.MerchSale.list("-created_date", 200),
      base44.entities.TicketSale.list("-created_date", 200).catch(() => []),
    ]).then(([tourList, venues, expenses, merchSales, ticketSales]) => {
      setTours(tourList);
      setAll({ venues, expenses, merchSales, ticketSales });
      setLoading(false);
    });
  }, []);

  const overall = all ? computeTotals(all) : null;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Finances & Legal</p>
          <h1 className="font-heading text-4xl font-bold">Tour Finance</h1>
          <p className="text-muted-foreground text-sm mt-1">Every tour's money in one place — open a tour to track its expenses, merch, tickets, and net profit.</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* All-time totals */}
            {overall && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="rounded-2xl bg-card border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Show Payouts</p>
                  <p className="font-heading font-bold text-xl text-green-600">{fmt(overall.totalPayout)}</p>
                </div>
                <div className="rounded-2xl bg-card border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Ticket Revenue</p>
                  <p className="font-heading font-bold text-xl text-green-600">{fmt(overall.totalTicketRevenue)}</p>
                </div>
                <div className="rounded-2xl bg-card border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Merch Net</p>
                  <p className="font-heading font-bold text-xl text-green-600">{fmt(overall.totalMerchRevenue - overall.totalMerchCost)}</p>
                </div>
                <div className="rounded-2xl bg-card border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
                  <p className="font-heading font-bold text-xl text-destructive">{fmt(overall.totalExpenses)}</p>
                </div>
                <div className={`rounded-2xl border p-4 text-center ${overall.netProfit >= 0 ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"}`}>
                  <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
                  <div className="flex items-center justify-center gap-1">
                    {overall.netProfit >= 0 ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                    <p className={`font-heading font-bold text-xl ${overall.netProfit >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(overall.netProfit)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tours grid */}
            {tours.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <DollarSign className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-heading font-bold text-lg">No tours yet</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Plan a tour first — its finances will live here.</p>
                <Button asChild className="mx-auto"><Link to="/tour-planner">Go to Tour Planner</Link></Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tours.map(tour => (
                  <TourFinanceCard key={tour.id} tour={tour} data={scopeTourData(tour, all)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}