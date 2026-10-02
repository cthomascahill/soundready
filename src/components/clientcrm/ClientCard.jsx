import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronRight, ChevronLeft, Trash2, Phone, Loader2, FolderOpen } from "lucide-react";

const STAGES = ["Prospect", "Pitched", "Negotiating", "Closed"];

/**
 * One client card in the CRM pipeline — move them through deal stages,
 * log contact, or remove them.
 */
export default function ClientCard({ client, onUpdated, onRemoved, onOpen }) {
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [termsDraft, setTermsDraft] = useState("");
  const stageIndex = STAGES.indexOf(client.stage);

  const saveNotes = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await base44.entities.ProducerClient.update(client.id, {
        notes: notesDraft,
        terms: termsDraft,
      });
      onUpdated(updated);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

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

      <div className="space-y-1.5">
        <button
          onClick={() => { setExpanded(!expanded); setEditing(false); }}
          className="text-[10px] text-primary hover:underline"
        >
          {expanded ? "Hide notes" : client.notes || client.terms ? "Notes" : "Add note"}
        </button>
        {expanded && !editing && (
          <div className="space-y-1.5">
            {client.notes || client.terms ? (
              <p className="text-[11px] text-muted-foreground leading-relaxed rounded-lg bg-secondary/50 border border-border p-2 whitespace-pre-wrap">
                {client.terms ? `Terms: ${client.terms}\n` : ""}
                {client.notes || ""}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground/70">No notes on this client yet.</p>
            )}
            <button
              onClick={() => { setNotesDraft(client.notes || ""); setTermsDraft(client.terms || ""); setEditing(true); }}
              className="text-[10px] text-primary hover:underline"
            >
              Edit
            </button>
          </div>
        )}
        {expanded && editing && (
          <div className="space-y-2">
            <input
              value={termsDraft}
              onChange={(e) => setTermsDraft(e.target.value)}
              placeholder="Terms — lease/exclusive, fee, splits…"
              className="w-full rounded-lg border border-input bg-transparent px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Notes — what's next, follow-ups, last conversation…"
              className="w-full h-20 rounded-lg border border-input bg-transparent px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
            <div className="flex gap-1.5">
              <button
                onClick={saveNotes}
                disabled={busy}
                className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-2.5 py-1 rounded-lg border border-border text-muted-foreground text-[10px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[10px] text-muted-foreground/70">
          {client.last_contact_date
            ? `Last contact ${new Date(client.last_contact_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            : "No contact logged"}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onOpen?.(client)}
            title="Open projects & songs"
            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <FolderOpen className="h-3 w-3" />
          </button>
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