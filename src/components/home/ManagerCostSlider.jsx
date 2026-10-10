import { useState } from "react";
import { Slider } from "@/components/ui/slider";

const MANAGER_RATE = 0.175; // midpoint of the typical 15–20% commission
const SAM_MONTHLY = 59;
const fmt = (n) => `$${Math.round(n).toLocaleString()}`;

export default function ManagerCostSlider() {
  const [income, setIncome] = useState(3000);
  const managerMonthly = income * MANAGER_RATE;
  const managerYearly = managerMonthly * 12;
  const samYearly = SAM_MONTHLY * 12;
  const savings = managerYearly - samYearly;

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
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Traditional manager</p>
          <p className="font-heading text-2xl font-black text-destructive">{fmt(managerMonthly)}<span className="text-xs font-bold text-muted-foreground">/mo</span></p>
          <p className="text-xs text-muted-foreground">{fmt(managerYearly)} every year, and it grows with every raise</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SoundReady Digital Manager</p>
          <p className="font-heading text-2xl font-black text-primary"><span className="text-xs line-through opacity-60 font-bold text-muted-foreground mr-1">$79</span>$59<span className="text-xs font-bold text-muted-foreground">/mo</span></p>
          <p className="text-xs text-muted-foreground">{fmt(samYearly)} every year, flat, forever</p>
        </div>
      </div>

      <p className="text-center text-sm font-semibold">
        {savings > 0 ? (
          <span className="text-foreground">A traditional manager's fee on that income would be <span className="text-primary">{fmt(managerYearly)}/year</span>. Digital Manager is <span className="text-primary">{fmt(samYearly)}/year</span> — <span className="text-primary">{fmt(savings)} less in fees</span>.</span>
        ) : (
          <span className="text-muted-foreground">Earning under $343/mo? Then your problem isn't the fee, it's revenue. SAM is built to fix exactly that, working your career every week until you clear it. And at over $343/mo, SAM costs less than a manager's fee, forever.</span>
        )}
      </p>
      <p className="text-center text-xs text-muted-foreground -mt-2">
        Fee comparison only. It assumes you would otherwise pay a human manager the typical 15–20% commission (17.5% shown). Digital Manager doesn't do the same work a human manager does, and this isn't a guarantee of the same results — or guaranteed savings.
      </p>
    </div>
  );
}