import { useState, useEffect } from "react";
import { Zap, Gift, Upload, MailCheck, Disc3, ListChecks } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { POINTS_TABLE } from "@/lib/awardPoints";

const EARN_RULES = [
  { icon: ListChecks, label: "Check off a to-do", points: POINTS_TABLE.todo_done },
  { icon: Upload, label: "Upload a song to your Vault", points: POINTS_TABLE.song_uploaded },
  { icon: MailCheck, label: "Approve one of Sam's emails", points: POINTS_TABLE.email_approved },
  { icon: Disc3, label: "Release a song", points: POINTS_TABLE.song_released },
];

const REWARDS = [
  "Gift card to Boost Collective",
  "A free month of SoundReady",
  "Subscriptions to plugins",
];

// Points balance, earn rates and the rewards program teaser.
export default function RewardsCard() {
  const [total, setTotal] = useState(null);

  useEffect(() => {
    base44.entities.PointsEvent.list("-created_date", 500)
      .then((events) => setTotal(events.reduce((sum, e) => sum + (e.points || 0), 0)))
      .catch(() => setTotal(0));
    const onAwarded = (e) => setTotal((t) => (t || 0) + (e.detail?.points || 0));
    window.addEventListener("sr-points-awarded", onAwarded);
    return () => window.removeEventListener("sr-points-awarded", onAwarded);
  }, []);

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold">SoundReady Points</h3>
            <p className="text-xs text-muted-foreground">Earned by actually getting things done</p>
          </div>
        </div>
        <p className="font-heading text-3xl font-bold text-primary">
          {total === null ? "…" : total.toLocaleString()}
        </p>
      </div>

      <div className="space-y-1.5">
        {EARN_RULES.map(({ icon: Icon, label, points }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" /> {label}
            </span>
            <span className="font-bold text-primary">+{points}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
          <Gift className="h-3.5 w-3.5" /> Rewards program — coming soon
        </p>
        <p className="text-xs text-muted-foreground">
          Points will convert into real rewards. On the table so far:
        </p>
        <ul className="text-sm space-y-1">
          {REWARDS.map((r) => (
            <li key={r} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" /> {r}
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-muted-foreground/70">
          We're still deciding the full rewards menu — your points are already stacking either way.
        </p>
      </div>
    </div>
  );
}