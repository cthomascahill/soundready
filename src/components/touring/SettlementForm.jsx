import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DEAL_TYPES = [
  ["guarantee", "Guarantee"],
  ["door_split", "Door split"],
  ["guarantee_plus_door", "Guarantee + door"],
  ["flat", "Flat fee (paid upfront)"],
];

export function computeNet(f) {
  const num = (v) => (typeof v === "number" ? v : parseFloat(v) || 0);
  let net = 0;
  if (f.deal_type === "flat") {
    net = num(f.guarantee);
  } else {
    if (f.deal_type !== "door_split") net += num(f.guarantee);
    if (f.deal_type !== "guarantee") net += (num(f.gross_door) * num(f.artist_door_pct)) / 100;
  }
  net += num(f.merch_gross) * (1 - num(f.merch_venue_pct) / 100);
  net -= num(f.deductions);
  return Math.round(net * 100) / 100;
}

const fmt = (n) => (n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function SettlementForm({ open, onOpenChange, initial, onSaved }) {
  const [f, setF] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setF({ deal_type: "guarantee", ...(initial || {}) });
      setError("");
    }
  }, [open, initial]);

  const set = (key, value) => setF((prev) => ({ ...prev, [key]: value }));
  const net = computeNet(f);

  const save = async () => {
    if (!f.venue || !f.show_date) {
      setError("Venue and show date are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...f, net_payout: net };
      if (initial?.id) {
        await base44.entities.ShowSettlement.update(initial.id, payload);
      } else {
        await base44.entities.ShowSettlement.create(payload);
      }
      onOpenChange(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const numberField = (key, label, placeholder, extra = "") => (
    <div className={`space-y-1.5 ${extra}`}>
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <Input
        type="number"
        inputMode="decimal"
        min="0"
        placeholder={placeholder}
        value={f[key] ?? ""}
        onChange={(e) => set(key, e.target.value === "" ? "" : parseFloat(e.target.value))}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Settlement" : "New Settlement"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Show Date</label>
              <Input type="date" value={f.show_date || ""} onChange={(e) => set("show_date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Venue</label>
              <Input placeholder="e.g. The Blue Note" value={f.venue || ""} onChange={(e) => set("venue", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">City / State</label>
              <Input placeholder="e.g. Denver, CO" value={f.city || ""} onChange={(e) => set("city", e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-primary uppercase tracking-widest font-bold">The Deal</p>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Deal Type</label>
              <Select value={f.deal_type} onValueChange={(v) => set("deal_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEAL_TYPES.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {numberField("guarantee", "Guarantee / Flat Fee ($)", "e.g. 300")}
              {numberField("door_count", "Paid Heads", "e.g. 74")}
              {numberField("gross_door", "Gross Door ($)", "e.g. 444")}
              {numberField("artist_door_pct", "Artist Door Share (%)", "e.g. 70")}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-primary uppercase tracking-widest font-bold">Deductions & Merch</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {numberField("deductions", "Deductions ($)", "e.g. 50")}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Deductions For</label>
                <Input placeholder="e.g. Sound tech, door person" value={f.deductions_note || ""} onChange={(e) => set("deductions_note", e.target.value)} />
              </div>
              {numberField("merch_gross", "Merch Gross ($)", "e.g. 260")}
              {numberField("merch_venue_pct", "Venue Merch Cut (%)", "e.g. 10")}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-primary uppercase tracking-widest font-bold">Status</p>
            <div className="flex flex-wrap gap-2">
              {[["pending", "Pending"], ["settled", "Settled"], ["paid", "Paid"]].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("status", value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    (f.status || "pending") === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/40 p-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Net payout for the night</p>
            <p className="font-heading text-2xl font-black text-primary">{fmt(net)}</p>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {initial?.id ? "Save Changes" : "Add Settlement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}