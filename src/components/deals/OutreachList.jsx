import OutreachCard from "@/components/deals/OutreachCard";

export default function OutreachList({ records, loading, onUpdated }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse" />)}
      </div>
    );
  }
  if (!records.length) return null;
  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Your {records.length} tracked {records.length === 1 ? "outreach" : "outreach"}
      </p>
      {records.map(r => <OutreachCard key={r.id} record={r} onUpdated={onUpdated} />)}
    </div>
  );
}