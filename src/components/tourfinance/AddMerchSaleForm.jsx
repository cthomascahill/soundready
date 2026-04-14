import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["T-Shirt", "Hoodie", "Hat", "Vinyl", "CD", "Poster", "Sticker", "Other"];

export default function AddMerchSaleForm({ venues, onAdd, onClose }) {
  const [form, setForm] = useState({
    venue_id: "", venue_name: "", show_date: "",
    product_name: "", category: "T-Shirt",
    quantity_sold: "1", unit_price: "", unit_cost: "", notes: "",
  });

  const set = (k) => (e) => {
    const val = e.target.value;
    if (k === "venue_id") {
      const v = venues.find(x => x.id === val);
      setForm(f => ({ ...f, venue_id: val, venue_name: v?.name || "", show_date: v?.performance_date || "" }));
    } else {
      setForm(f => ({ ...f, [k]: val }));
    }
  };

  const valid = form.product_name && form.quantity_sold && form.unit_price && Number(form.unit_price) > 0;

  const handleAdd = () => {
    if (!valid) return;
    const qty = Number(form.quantity_sold);
    const price = Number(form.unit_price);
    const cost = Number(form.unit_cost || 0);
    onAdd({ ...form, quantity_sold: qty, unit_price: price, unit_cost: cost, total_revenue: qty * price, total_cost: qty * cost });
  };

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl bg-card border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-heading font-bold">Add Merch Sale</p>
        <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Category *</label>
          <select value={form.category} onChange={set("category")} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <label className="text-xs text-muted-foreground font-medium">Product Name *</label>
          <Input value={form.product_name} onChange={set("product_name")} placeholder="e.g. Black Logo Tee" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Qty Sold *</label>
          <Input type="number" min="1" value={form.quantity_sold} onChange={set("quantity_sold")} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Sale Price / Unit ($) *</label>
          <Input type="number" min="0" step="0.01" value={form.unit_price} onChange={set("unit_price")} placeholder="25.00" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Production Cost / Unit ($)</label>
          <Input type="number" min="0" step="0.01" value={form.unit_cost} onChange={set("unit_cost")} placeholder="8.00" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Link to Venue</label>
          <select value={form.venue_id} onChange={set("venue_id")} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">No venue</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Show Date</label>
          <Input type="date" value={form.show_date} onChange={set("show_date")} />
        </div>
      </div>
      {form.unit_price && form.quantity_sold && (
        <p className="text-xs text-muted-foreground">
          Revenue: <strong className="text-chart-4">${(Number(form.unit_price) * Number(form.quantity_sold)).toFixed(2)}</strong>
          {form.unit_cost ? <> · Cost: <strong className="text-destructive">${(Number(form.unit_cost) * Number(form.quantity_sold)).toFixed(2)}</strong>
            · Net: <strong className="text-primary">${((Number(form.unit_price) - Number(form.unit_cost || 0)) * Number(form.quantity_sold)).toFixed(2)}</strong></> : ""}
        </p>
      )}
      <div className="flex gap-2">
        <Button onClick={handleAdd} disabled={!valid} className="gap-2"><Check className="h-4 w-4" />Add Sale</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </motion.div>
  );
}