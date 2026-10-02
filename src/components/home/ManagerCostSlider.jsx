import { useState } from "react";
import { Slider } from "@/components/ui/slider";

const MANAGER_RATE = 0.175; // midpoint of the typical 15–20% commission
const MAYA_MONTHLY = 60;
const fmt = (n) => `$${Math.round(n).toLocaleString()}`;

export default function ManagerCostSlider() {
  const [income, setIncome] = useState(3000);
  const managerMonthly = income * MANAGER_RATE;
  const managerYearly = managerMonthly * 12;
  const mayaYearly = MAYA_MONTHLY * 12;
  const savings = managerYearly - mayaYearly;

  return (
    <div className="pt-6 mt-2 border-t border-border/60 text-left space-y-5">
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-heading font-bold text-sm">What does a manager really cost you?</p>
          <p className="font-heading text-2xl font-black text-primary whitespace-nowrap">{fmt(income)}<span className="text-xs font-bold text-muted-foreground">/mo</span></p>
        </div>
        <p className="text-xs text-muted-foreground -mt-1">Drag to set your monthly music income.</p>
        <Slider value={[income]} onValueChange={([v]) => setIncome(v)} min={0} max={20000} step={100} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-destructive/10 border border-destructive/25 p-4 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Traditional manager</p>
          <p className="font-heading text-2xl font-black text-destructive">{fmt(managerMonthly)}<span className="text-xs font-bold text-muted-foreground">/mo</span></p>
          <p className="text-xs text-muted-foreground">{fmt(managerYearly)} every year — and it grows with every raise</p>
        </div>
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SoundReady AI Manager</p>
          <p className="font-heading text-2xl font-black text-primary">$60<span className="text-xs font-bold text-muted-foreground">/mo</span></p>
          <p className="text-xs text-muted-foreground">{fmt(mayaYearly)} every year — flat, forever</p>
        </div>
      </div>

      <p className="text-center text-sm font-semibold">
        {savings > 0 ? (
          <span className="text-primary">You keep an extra {fmt(savings)} every year with Maya.</span>
        ) : (
          <span className="text-muted-foreground">Maya costs less than a manager the moment you earn over $343/mo — and never takes a cut of your next raise.</span>
        )}
      </p>
    </div>
  );
}