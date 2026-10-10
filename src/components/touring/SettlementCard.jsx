import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

const fmt = (n) => (n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
const fmtDate = (d) => {
  try {
    return new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
};

const DEAL_LABELS = {
  guarantee: "Guarantee",
  door_split: "Door split",
  guarantee_plus_door: "Guarantee + door",
  flat: "Flat fee",
};

const STATUS_STYLES = {
  pending: "bg-yellow-500/10 border-yellow-500/25 text-yellow-400",
  settled: "bg-cyan-500/5 border-cyan-500/20 text-cyan-400",
  paid: "bg-primary/10 border-primary/25 text-primary",
};

const NEXT_STATUS = { pending: "settled", settled: "paid" };
const NEXT_LABEL = { pending: "Mark settled", settled: "Mark paid" };

export default function SettlementCard({ s, onEdit, onDelete, onChanged }) {
  const doorTake = ((s.gross_door || 0) * (s.artist_door_pct || 0)) / 100;
  const merchNet = (s.merch_gross || 0) * (1 - (s.merch_venue_pct || 0) / 100);

  const advance = async () => {
    const next = NEXT_STATUS[s.status];
    if (!next) return;
    await base44.entities.ShowSettlement.update(s.id, { status: next });
    onChanged();
  };

  return (
    <div className="rounded-2xl border border-chart-5/20 bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading font-bold text-lg leading-tight">{s.venue}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {fmtDate(s.show_date)}{s.city && (<><span>·</span><MapPin className="h-3 w-3" />{s.city}</>)}
          </p>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[s.status] || STATUS_STYLES.pending}`}>
          {s.status || "pending"}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        <span className="text-foreground font-semibold">{DEAL_LABELS[s.deal_type] || s.deal_type}</span>
        {s.door_count ? ` · ${s.door_count} paid heads` : ""}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {!!s.guarantee && s.deal_type !== "door_split" && (
          <span className="px-2 py-1 rounded-full bg-chart-5/5 border border-chart-5/20 text-[10px] font-semibold text-chart-5">
            Guarantee {fmt(s.guarantee)}
          </span>
        )}
        {!!doorTake && (
          <span className="px-2 py-1 rounded-full bg-chart-5/5 border border-chart-5/20 text-[10px] font-semibold text-chart-5">
            Door take {fmt(doorTake)}{s.artist_door_pct ? ` (${s.artist_door_pct}% of ${fmt(s.gross_door)})` : ""}
          </span>
        )}
        {!!merchNet && (
          <span className="px-2 py-1 rounded-full bg-chart-5/5 border border-chart-5/20 text-[10px] font-semibold text-chart-5">
            Merch net {fmt(merchNet)}{s.merch_venue_pct ? ` (after ${s.merch_venue_pct}% cut)` : ""}
          </span>
        )}
        {!!s.deductions && (
          <span className="px-2 py-1 rounded-full bg-red-500/5 border border-red-500/20 text-[10px] font-semibold text-red-400">
            −{fmt(s.deductions)}{s.deductions_note ? ` (${s.deductions_note})` : ""}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-secondary/40 border border-border px-4 py-2.5">
        <p className="text-xs text-muted-foreground">Net payout</p>
        <p className="font-heading text-xl font-black text-chart-5">{fmt(s.net_payout)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {NEXT_STATUS[s.status] && (
          <Button size="sm" onClick={advance} className="gap-1.5">
            {s.status === "paid" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
            {NEXT_LABEL[s.status]}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => onEdit(s)} className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(s)} className="gap-1.5 text-red-400 hover:text-red-300">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>

      {s.notes && <p className="text-xs text-muted-foreground leading-relaxed pt-1">{s.notes}</p>}
    </div>
  );
}