import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronRight, ChevronLeft, Trash2, Phone, Loader2 } from "lucide-react";

const STAGES = ["Prospect", "Pitched", "Negotiating", "Closed"];

/**
 * One client card in the CRM pipeline — move them through deal stages,
 * log contact, or remove them.
 */
export default function ClientCard({ client, onUpdated, onRemoved }) {
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const stageIndex = STAGES.indexOf(client.stage);

  const move = async (dir) => {
    const next = STAGES[Math.min(Math.max(stageIndex + dir, 0), STAGES.length - 1)];
    if (next === client.stage || busy) return;
    setBusy(true);
    try {
      const updated = await base44.entities.ProducerClient.update(client.id, {
        stage: next,
        last_contact_date: new Date().toISOString().split("T")[0],
      });
      onUpdated(updated);
    } finally {
      setBusy(false);
    }
  };

  const logContact = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await base44.entities.ProducerClient.update(client.id, {
        last_contact_date: new Date().toISOString().split("T")[0],
      });
      onUpdated(updated);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Remove ${client.name} from your pipeline?`) || busy) return;
    setBusy(true);
    try {
      await base44.entities.ProducerClient.delete(client.id);
      onRemoved(client.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl bg-card border border-border p-3.5 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{client.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {client.email || client.sound || "No contact info"}
          </p>
        </div>
        <div className="flex gap-0.5 shrink-0">
          <button
            onClick={() => move(-1)}
            disabled={stageIndex === 0 || busy}
            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => move(1)}
            disabled={stageIndex === STAGES.length - 1 || busy}
            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {client.beat_title && (
        <p className="text-[10px] text-muted-foreground/80 truncate">On "{client.beat_title}"</p>
      )}

      {(client.notes || client.terms) && (
        <>
          <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-primary hover:underline">
            {expanded ? "Hide notes" : "Notes"}
          </button>
          {expanded && (
            <p className="text-[11px] text-muted-foreground leading-relaxed rounded-lg bg-secondary/50 border border-border p-2 whitespace-pre-wrap">
              {client.terms ? `Terms: ${client.terms}\n` : ""}
              {client.notes}
            </p>
          )}
        </>
      )}

      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[10px] text-muted-foreground/70">
          {client.last_contact_date
            ? `Last contact ${new Date(client.last_contact_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            : "No contact logged"}
        </span>
        <div className="flex gap-1">
          <button
            onClick={logContact}
            disabled={busy}
            title="Log contact today"
            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Phone className="h-3 w-3" />
          </button>
          <button
            onClick={remove}
            disabled={busy}
            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}