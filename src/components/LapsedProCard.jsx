import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getTier } from "@/lib/tier";
import CheckoutButton from "@/components/billing/CheckoutButton";
import { Lock } from "lucide-react";

// A user whose Pro/AI Manager plan ended but whose data is still here.
export function isLapsedPro(user) {
  return !!user && getTier(user) === "free" && user.subscription_status === "canceled";
}

// "What you're missing" summary with the user's own locked data, to win them back.
export default function LapsedProCard({ feature }) {
  const { user } = useAuth();
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.PipelineSong.filter({ created_by_id: user.id }, null, 500),
      base44.entities.Venue.filter({ created_by_id: user.id }, null, 500),
      base44.entities.ProducerClient.filter({ created_by_id: user.id }, null, 500),
    ])
      .then(([songs, venues, clients]) =>
        setCounts({ songs: songs.length, venues: venues.length, clients: clients.length })
      )
      .catch(() => setCounts({ songs: 0, venues: 0, clients: 0 }));
  }, [user]);

  if (!isLapsedPro(user)) return null;

  const items = [
    { label: "songs in your Song Tracker", n: counts?.songs },
    { label: "venues and tours you were working", n: counts?.venues },
    { label: "producer clients in your CRM", n: counts?.clients },
  ].filter((i) => i.n > 0);

  return (
    <div className="rounded-2xl border border-chart-5/20 bg-card p-8 space-y-6 relative overflow-hidden pt-10">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-chart-5 text-black">
        Your Artist Pro ended
      </div>
      <div className="h-12 w-12 rounded-xl bg-chart-5/10 border border-chart-5/20 flex items-center justify-center">
        <Lock className="h-5 w-5 text-chart-5" />
      </div>
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-black">
          {feature ? `${feature} is waiting for you` : "Your Pro tools are waiting"}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Nothing was deleted — your work is exactly where you left it. Come back and pick up where you stopped.
        </p>
      </div>
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
              <span className="font-heading text-xl font-bold text-chart-5">{item.n}</span>
              <span className="text-xs text-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      )}
      <CheckoutButton tier="pro" className="bg-chart-5 hover:bg-chart-5/90 text-black">
        Reactivate Artist Pro
      </CheckoutButton>
      <p className="text-center text-xs text-muted-foreground">
        Reactivate anytime — everything is still here.
      </p>
    </div>
  );
}