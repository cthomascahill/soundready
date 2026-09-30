// Shared helpers for by-tour finances (directory + per-tour workspace)

export function fmt(n) {
  return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${Number(n).toFixed(2)}`;
}

export function computeTotals({ venues = [], expenses = [], merchSales = [], ticketSales = [] }) {
  const totalPayout = venues.reduce((s, v) => s + Number(v.payout_received || 0), 0);
  const totalMerchRevenue = merchSales.reduce((s, m) => s + Number(m.total_revenue || m.quantity_sold * m.unit_price || 0), 0);
  const totalMerchCost = merchSales.reduce((s, m) => s + Number(m.total_cost || m.quantity_sold * (m.unit_cost || 0) || 0), 0);
  const totalTicketRevenue = ticketSales.reduce((s, t) => s + Number(t.gross_revenue || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const netProfit = totalPayout + (totalMerchRevenue - totalMerchCost) + totalTicketRevenue - totalExpenses;
  return { totalPayout, totalMerchRevenue, totalMerchCost, totalTicketRevenue, totalExpenses, netProfit };
}

// A record belongs to a tour if it carries the tour's id or is linked to a
// venue assigned to that tour (covers expenses/merch/tickets created before
// the by-tour rework).
export function scopeTourData(tour, { venues = [], expenses = [], merchSales = [], ticketSales = [] }) {
  const tourVenues = venues.filter((v) => v.tour_id === tour.id);
  const ids = new Set(tourVenues.map((v) => v.id));
  return {
    tourVenues,
    expenses: expenses.filter((e) => e.tour_id === tour.id || ids.has(e.venue_id)),
    ticketSales: ticketSales.filter((t) => ids.has(t.venue_id)),
    merchSales: merchSales.filter((m) => ids.has(m.venue_id)),
  };
}