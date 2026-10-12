import { Input } from "@/components/ui/input";

// Shared building blocks for the platform connection cards: freshness badge,
// stat tile and labeled input field.

export function getFreshness(last_synced) {
  if (!last_synced) return { status: "missing", label: "Never synced", color: "bg-zinc-600", textColor: "text-zinc-400" };
  const ageHours = (Date.now() - new Date(last_synced).getTime()) / (1000 * 60 * 60);
  if (ageHours < 24) return { status: "live", label: "Live", color: "bg-green-500", textColor: "text-green-400" };
  if (ageHours < 48) return { status: "syncing", label: "Syncing soon", color: "bg-yellow-400", textColor: "text-yellow-400" };
  return { status: "stale", label: "Needs refresh", color: "bg-red-500", textColor: "text-red-400" };
}

export function FreshnessBadge({ last_synced }) {
  const f = getFreshness(last_synced);
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${f.textColor}`}>
      <span className={`h-2 w-2 rounded-full ${f.color} ${f.status === "live" ? "animate-pulse" : ""}`} />
      {f.label}
      {last_synced && <span className="text-muted-foreground font-normal">· {new Date(last_synced).toLocaleDateString()}</span>}
    </div>
  );
}

export function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

export function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-8 text-sm" />
    </div>
  );
}