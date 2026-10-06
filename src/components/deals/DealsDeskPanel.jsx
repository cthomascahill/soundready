import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { STATUS_META, CATEGORY_META } from "@/components/deals/dealStatus";
import { Loader2, ChevronRight, Handshake } from "lucide-react";

function DealRow({ record }) {
  const meta = STATUS_META[record.status] || STATUS_META.researched;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Handshake className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold truncate">{record.company_name}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${meta.chip}`}>
            {meta.label}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {CATEGORY_META[record.category]?.label || "Deal"}
          {record.contact_email ? ` · ${record.contact_email}` : ""}
        </p>
      </div>
      <Link to="/deals" className="shrink-0">
        <Button variant="ghost" size="sm" className="gap-1 text-primary">
          Open <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}

export default function DealsDeskPanel() {
  const { user } = useAuth();
  const [records, setRecords] = useState(null);

  useEffect(() => {
    if (!user?.id) { setRecords([]); return; }
    base44.entities.DealOutreach.filter({ user_id: user.id }, "-created_date", 100)
      .then(setRecords)
      .catch(() => setRecords([]));
  }, [user]);

  if (records === null) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const drafts = records.filter(r => r.status === "draft");
  const inMotion = records.filter(r => ["approved", "sent", "replied", "follow_up"].includes(r.status));

  if (drafts.length === 0 && inMotion.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-dashed border-border p-10 text-center space-y-3">
        <Handshake className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="font-semibold">No deal outreach yet</p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Sam can research record labels, distributors and sync houses, draft the pitches, and send them once you approve.
        </p>
        <Link to="/deals" className="inline-block">
          <Button variant="outline" size="sm" className="gap-1.5 font-semibold">
            Open the Deals workspace <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {drafts.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Pitches awaiting your approval ({drafts.length})
          </p>
          {drafts.map(r => <DealRow key={r.id} record={r} />)}
        </div>
      )}
      {inMotion.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            In motion ({inMotion.length})
          </p>
          {inMotion.map(r => <DealRow key={r.id} record={r} />)}
        </div>
      )}
      <Link to="/deals" className="inline-block">
        <Button variant="outline" size="sm" className="gap-1.5 font-semibold">
          Manage deals <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}