import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const esc = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Exports a tour's full finances — summary, shows, expenses, tickets, merch —
 * as one CSV download.
 */
export default function ExportTourFinance({ tour, venues, expenses, merchSales, ticketSales, totals }) {
  const handleExport = () => {
    const rows = [
      [`Tour Finance Export — ${tour?.name || "Tour"}`],
      ["Show Payouts", totals.totalPayout],
      ["Ticket Revenue", totals.totalTicketRevenue],
      ["Merch Net", (totals.totalMerchRevenue || 0) - (totals.totalMerchCost || 0)],
      ["Total Expenses", totals.totalExpenses],
      ["Net Profit", totals.netProfit],
      [],
      ["SHOWS"],
      ["Venue", "City", "Date", "Status", "Capacity", "Payout Received"],
      ...venues.map(v => [v.name, v.city, v.performance_date, v.status, v.capacity, v.payout_received]),
      [],
      ["EXPENSES"],
      ["Show", "Date", "Category", "Description", "Amount", "Paid By", "Reimbursed"],
      ...expenses.map(e => [e.venue_name || "—", e.show_date, e.category, e.description, e.amount, e.paid_by, e.reimbursed ? "Yes" : "No"]),
      [],
      ["TICKET SALES"],
      ["Show", "Date", "Tickets Sold", "Ticket Price", "Gross Revenue"],
      ...ticketSales.map(t => [t.venue_name || "—", t.show_date, t.tickets_sold, t.ticket_price, t.gross_revenue]),
      [],
      ["MERCH SALES"],
      ["Show", "Date", "Product", "Quantity", "Unit Price", "Unit Cost", "Total Revenue", "Total Cost"],
      ...merchSales.map(m => [
        m.venue_name || "—", m.show_date, m.product_name, m.quantity_sold, m.unit_price, m.unit_cost, m.total_revenue, m.total_cost,
      ]),
    ];
    const csv = rows.map(r => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tour-finance-${(tour?.name || "tour").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" /> Export
    </Button>
  );
}