import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import SettlementCard from "@/components/touring/SettlementCard";
import SettlementForm from "@/components/touring/SettlementForm";

const fmt = (n) => (n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function Settlements() {
  const [items, setItems] = useState(null);
  const [totals, setTotals] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    base44.entities.ShowSettlement.filter({}, { sort: "-show_date", limit: 100 })
      .then((page) => setItems(page.items))
      .catch(() => setItems([]));
    base44.entities.ShowSettlement.aggregate({ groupBy: "status", sum: ["net_payout"] })
      .then((r) => setTotals(r.rows || []))
      .catch(() => setTotals([]));
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.ShowSettlement.subscribe(() => load());
    return unsub;
  }, []);

  const byStatus = Object.fromEntries(totals.map((r) => [r.status, r]));
  const totalAll = totals.reduce((sum, r) => sum + (r.sum_net_payout || 0), 0);

  const remove = async (s) => {
    if (!window.confirm(`Delete the settlement for ${s.venue}?`)) return;
    await base44.entities.ShowSettlement.delete(s.id);
    load();
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <SEO title="Settlements — SoundReady" description="Count the money after the night: door counts, deal terms, deductions, merch and net payout, tracked until you're paid." />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs text-chart-5 uppercase tracking-widest font-bold">Touring</p>
          <h1 className="font-heading text-4xl font-bold flex items-center gap-3">
            <Receipt className="h-8 w-8 text-chart-5" /> Settlements
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            The after-show math — door count, deal terms, deductions and merch — with the net payout tracked until the money is in your account.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New Settlement
        </Button>
      </div>

      {/* Totals strip — one aggregate per load, grouped by status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total net (all shows)", value: totalAll, count: totals.reduce((n, r) => n + r.count, 0), accent: "text-chart-5" },
          { label: "Pending", value: byStatus.pending?.sum_net_payout, count: byStatus.pending?.count, accent: "text-yellow-400" },
          { label: "Settled", value: byStatus.settled?.sum_net_payout, count: byStatus.settled?.count, accent: "text-cyan-400" },
          { label: "Paid", value: byStatus.paid?.sum_net_payout, count: byStatus.paid?.count, accent: "text-primary" },
        ].map((t) => (
          <div key={t.label} className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">{t.label}</p>
            <p className={`font-heading text-xl font-black ${t.accent}`}>{fmt(t.value)}</p>
            <p className="text-[11px] text-muted-foreground">{t.count || 0} show{(t.count || 0) === 1 ? "" : "s"}</p>
          </div>
        ))}
      </div>

      {items === null ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <Receipt className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="font-heading font-bold">No settlements yet</p>
          <p className="text-sm text-muted-foreground">After your next show, put the numbers in here — you'll see exactly what each gig really paid.</p>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> New Settlement
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((s) => (
            <SettlementCard key={s.id} s={s} onEdit={(x) => { setEditing(x); setFormOpen(true); }} onDelete={remove} onChanged={load} />
          ))}
        </div>
      )}

      <SettlementForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSaved={load}
      />
    </div>
  );
}