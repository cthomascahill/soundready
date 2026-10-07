import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Loader2, Gauge, AlertTriangle } from "lucide-react";

// Admin view of Sam fair-use usage across all artists: per-month workload,
// purchased extra units, and recent task failures. Numbers only — one
// artist's task content is never shown here.
export default function SamUsageAdmin() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("samUsageAdmin");
        let users = [];
        try { users = await base44.entities.User.list("-created_date", 200); } catch {}
        const byId = new Map(users.map(u => [u.id, u.email || u.full_name || u.id]));
        if (alive) setData({ ...res.data, byId });
      } catch (err) {
        if (alive) setError(err.message || "Couldn't load usage.");
      }
    })();
    return () => { alive = false; };
  }, []);

  if (error) return <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-red-400">{error}</div>;
  if (!data) return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const { config, rows, recent_failures: failures, byId } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs text-primary uppercase tracking-widest font-medium">Sam · Fair-use</p>
        <h1 className="font-heading text-3xl font-bold">Usage overview</h1>
        <p className="text-sm text-muted-foreground">How much Sam research capacity each artist is using this month.</p>
      </motion.div>

      {/* Current policy */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Included / month", value: config.monthlyIncluded },
          { label: "Warn threshold", value: config.warnAt },
          { label: "Extra pack", value: `+${config.addOnUnits} units` },
          { label: "Per target", value: `${config.units.perTarget} units` },
        ].map(c => (
          <div key={c.label} className="rounded-2xl bg-card border border-border p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="font-heading font-bold text-lg mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Per-artist usage */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <p className="font-heading font-bold text-sm">Artists this month</p>
        </div>
        {!rows.length ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">No Sam usage recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="px-5 py-2.5 font-medium">Artist</th>
                  <th className="px-3 py-2.5 font-medium">This month</th>
                  <th className="px-3 py-2.5 font-medium">Extra bought</th>
                  <th className="px-3 py-2.5 font-medium">Extra left</th>
                  <th className="px-3 py-2.5 font-medium">Tasks done</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.user_id} className="border-b border-border/50 last:border-0">
                    <td className="px-5 py-2.5 max-w-56 truncate">{byId.get(r.user_id) || r.user_id}</td>
                    <td className="px-3 py-2.5 font-semibold">{r.month_units} / {config.monthlyIncluded}</td>
                    <td className="px-3 py-2.5">{r.addon_purchased || "—"}</td>
                    <td className="px-3 py-2.5">{r.addon_purchased ? r.addon_remaining : "—"}</td>
                    <td className="px-3 py-2.5">{r.tasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent task failures */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <p className="font-heading font-bold text-sm">Recent failed tasks</p>
        </div>
        {!failures?.length ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">No recent failures.</p>
        ) : (
          <div className="divide-y divide-border/50">
            {failures.map(f => (
              <div key={f.task_id} className="px-5 py-3 space-y-1">
                <p className="text-xs text-muted-foreground">
                  {byId.get(f.user_id) || f.user_id} · {new Date(f.created_date).toLocaleString()}
                </p>
                <p className="text-xs text-foreground/90 line-clamp-2">{f.error || "No error recorded"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
        Fair-use limits and unit weights are set in one shared config that every Sam function reads. To adjust the policy — monthly allowance, warn threshold, unit weights, or extra-pack size — just say the word and they'll be updated everywhere at once.
      </p>
    </div>
  );
}