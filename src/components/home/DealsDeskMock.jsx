import { Handshake, TrendingUp } from "lucide-react";

// A static, product-accurate mock of the Deals desk: the catalog
// valuation slider with an advance estimate, plus one drafted deal pitch.
export default function DealsDeskMock() {
  return (
    <div className="rounded-2xl border border-primary/20 bg-card overflow-hidden text-left pointer-events-none select-none shadow-xl">
      <div className="px-5 pt-5 pb-3 space-y-3">
        <div className="flex items-center gap-2.5">
          <Handshake className="h-5 w-5 text-primary" />
          <p className="font-heading font-bold text-sm">Deals — what your catalog is worth</p>
        </div>
        <div className="rounded-xl bg-secondary/40 border border-border p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Yearly catalog revenue</span>
            <span className="font-heading font-bold text-sm">$8,400</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-border">
            <div className="absolute inset-y-0 left-0 w-[42%] rounded-full bg-primary" />
            <div className="absolute top-1/2 -translate-y-1/2 left-[42%] h-3.5 w-3.5 rounded-full bg-primary ring-4 ring-primary/20" />
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">Estimated advance today</span>
            <span className="font-heading font-black text-base text-primary">$12,600 – $16,800</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-snug">
            Based on 1.5–2x your yearly royalty run rate, checked against real catalog deals.
          </p>
        </div>
        <div className="rounded-lg bg-secondary/40 border border-border px-3 py-2 text-xs text-muted-foreground">
          Label and distributor pitches Sam drafted from your real numbers
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-border bg-secondary/30">
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate">Delta Noise Records</p>
          <p className="text-[10px] text-muted-foreground/70 truncate">Catalog advance · a&r@deltanoise.com</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary shrink-0">
          <TrendingUp className="h-3.5 w-3.5" /> Draft ready
        </span>
      </div>
    </div>
  );
}