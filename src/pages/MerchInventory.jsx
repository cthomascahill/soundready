import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Shirt, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import MerchItemCard from "@/components/touring/MerchItemCard";
import MerchItemForm from "@/components/touring/MerchItemForm";

const fmt = (n) => (n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function MerchInventory() {
  const [items, setItems] = useState(null);
  const [totals, setTotals] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    base44.entities.MerchItem.filter({}, { sort: "-created_date", limit: 100 })
      .then((page) => setItems(page.items))
      .catch(() => setItems([]));
    base44.entities.MerchItem.aggregate({ sum: ["stock_value", "potential_revenue", "sold_revenue"] })
      .then((r) => {
        const row = Array.isArray(r) ? r[0] : (r.rows?.[0] || {});
        setTotals(row);
      })
      .catch(() => setTotals({}));
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.MerchItem.subscribe(() => load());
    return unsub;
  }, []);

  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    await base44.entities.MerchItem.delete(item.id);
    load();
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <SEO title="Merch Inventory — SoundReady" description="Track your merch on the road: costs, prices, stock, sold tallies and what the table can make." />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs text-purple-400 uppercase tracking-widest font-bold">Touring</p>
          <h1 className="font-heading text-4xl font-bold flex items-center gap-3">
            <Shirt className="h-8 w-8 text-purple-400" /> Merch Inventory
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            Everything in the merch bin — what it cost, what it sells for, how many are left — with a one-tap tally at the table.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New Item
        </Button>
      </div>

      {/* Totals strip — one aggregate per load */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Inventory cost value", value: totals?.stock_value, accent: "text-purple-400" },
          { label: "Potential revenue (all stock)", value: totals?.potential_revenue, accent: "text-chart-5" },
          { label: "Gross sold to date", value: totals?.sold_revenue, accent: "text-primary" },
        ].map((t) => (
          <div key={t.label} className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">{t.label}</p>
            <p className={`font-heading text-xl font-black ${t.accent}`}>{fmt(t.value)}</p>
          </div>
        ))}
      </div>

      {items === null ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <Shirt className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="font-heading font-bold">No merch items yet</p>
          <p className="text-sm text-muted-foreground">Add what's in the bin so you always know what's left and what the table can make.</p>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> New Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((item) => (
            <MerchItemCard key={item.id} item={item} onEdit={(i) => { setEditing(i); setFormOpen(true); }} onDelete={remove} onChanged={load} />
          ))}
        </div>
      )}

      <MerchItemForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSaved={load}
      />
    </div>
  );
}