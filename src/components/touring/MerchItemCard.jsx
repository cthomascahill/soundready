import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, BadgePlus } from "lucide-react";
import { base44 } from "@/api/base44Client";

const fmt = (n) => (n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function MerchItemCard({ item, onEdit, onDelete, onChanged }) {
  const [selling, setSelling] = useState(false);
  const stock = item.stock || 0;

  const stockPill = stock === 0
    ? { label: "Sold out", cls: "bg-red-500/5 border-red-500/20 text-red-400" }
    : stock <= 5
      ? { label: `Low — ${stock} left`, cls: "bg-orange-500/5 border-orange-500/20 text-orange-400" }
      : { label: `${stock} in stock`, cls: "bg-purple-500/15 border-purple-500/25 text-purple-400" };

  const sellOne = async () => {
    if (stock === 0 || selling) return;
    setSelling(true);
    try {
      const nextStock = stock - 1;
      const nextSold = (item.sold || 0) + 1;
      await base44.entities.MerchItem.update(item.id, {
        stock: nextStock,
        sold: nextSold,
        stock_value: nextStock * (item.cost_per_unit || 0),
        potential_revenue: nextStock * (item.price || 0),
        sold_revenue: nextSold * (item.price || 0),
      });
      onChanged();
    } finally {
      setSelling(false);
    }
  };

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading font-bold text-lg leading-tight">{item.name}</p>
          {item.variant && <p className="text-xs text-muted-foreground mt-1">{item.variant}</p>}
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${stockPill.cls}`}>
          {stockPill.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {!!item.price && (
          <span className="px-2 py-1 rounded-full bg-purple-500/5 border border-purple-500/25 text-[10px] font-semibold text-purple-400">
            Sells {fmt(item.price)} · costs {fmt(item.cost_per_unit)}
          </span>
        )}
        {!!item.sold && (
          <span className="px-2 py-1 rounded-full bg-primary/10 border border-primary/25 text-[10px] font-semibold text-primary">
            {item.sold} sold · {fmt(item.sold_revenue)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-secondary/40 border border-border px-4 py-2.5">
        <p className="text-xs text-muted-foreground">Potential if it all sells</p>
        <p className="font-heading text-xl font-black text-purple-400">{fmt(item.potential_revenue)}</p>
      </div>

      {item.notes && <p className="text-xs text-muted-foreground leading-relaxed">{item.notes}</p>}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button size="sm" onClick={sellOne} disabled={stock === 0 || selling} className="gap-1.5">
          <BadgePlus className="h-3.5 w-3.5" /> Sold one
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(item)} className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(item)} className="gap-1.5 text-red-400 hover:text-red-300">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}