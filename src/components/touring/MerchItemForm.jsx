import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function MerchItemForm({ open, onOpenChange, initial, onSaved }) {
  const [f, setF] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setF(initial ? { ...initial } : {});
      setError("");
    }
  }, [open, initial]);

  const set = (key, value) => setF((prev) => ({ ...prev, [key]: value }));
  const num = (v) => (v === "" || v === null || v === undefined ? 0 : parseFloat(v) || 0);

  const margin = num(f.price) - num(f.cost_per_unit);
  const marginPct = num(f.price) > 0 ? Math.round((margin / num(f.price)) * 100) : 0;

  const save = async () => {
    if (!f.name) {
      setError("Give the item a name.");
      return;
    }
    setSaving(true);
    try {
      const stock = num(f.stock);
      const sold = num(initial?.sold);
      const cost = num(f.cost_per_unit);
      const price = num(f.price);
      const payload = {
        ...f,
        stock,
        sold,
        stock_value: stock * cost,
        potential_revenue: stock * price,
        sold_revenue: sold * price,
      };
      if (initial?.id) {
        await base44.entities.MerchItem.update(initial.id, payload);
      } else {
        await base44.entities.MerchItem.create(payload);
      }
      onOpenChange(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Merch Item" : "New Merch Item"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Item Name</Label>
            <Input placeholder="e.g. Logo tee" value={f.name || ""} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Variant</Label>
            <Input placeholder="e.g. L / Black" value={f.variant || ""} onChange={(e) => set("variant", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Cost / Unit ($)</Label>
              <Input type="number" inputMode="decimal" min="0" placeholder="e.g. 8" value={f.cost_per_unit ?? ""} onChange={(e) => set("cost_per_unit", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sells For ($)</Label>
              <Input type="number" inputMode="decimal" min="0" placeholder="e.g. 25" value={f.price ?? ""} onChange={(e) => set("price", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">In Stock</Label>
              <Input type="number" inputMode="numeric" min="0" placeholder="e.g. 40" value={f.stock ?? ""} onChange={(e) => set("stock", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Input placeholder="e.g. Reorder at printful.com/xyz, run S-XXL" value={f.notes || ""} onChange={(e) => set("notes", e.target.value)} />
          </div>

          {num(f.price) > 0 && (
            <p className="text-xs text-muted-foreground">
              Margin per unit: <span className={margin >= 0 ? "text-primary font-semibold" : "text-red-400 font-semibold"}>
                ${margin.toFixed(2)} ({marginPct}%)
              </span>
            </p>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {initial?.id ? "Save Changes" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}