import { useState } from "react";
import { Button } from "@/components/ui/button";

const OUTCOMES = [
  { key: "replied", label: "They replied" },
  { key: "progressed", label: "Progressed" },
  { key: "rejected", label: "Rejected" },
  { key: "no_reply", label: "No reply" },
];

/**
 * Records what happened after an approved action — replies, progress, rejection.
 * Sam feeds these outcomes back into future recommendations.
 */
export default function OutcomeControl({ outcome, note, onRecord }) {
  const [draftNote, setDraftNote] = useState(note || "");
  const [busy, setBusy] = useState(false);

  const record = async (key) => {
    if (busy) return;
    setBusy(true);
    try {
      await onRecord(key, draftNote.trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {OUTCOMES.map(o => (
          <button
            key={o.key}
            onClick={() => record(o.key)}
            disabled={busy}
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors disabled:opacity-50 ${
              outcome === o.key
                ? "bg-primary/15 text-primary border-primary/30"
                : "border-zinc-700 text-zinc-400 hover:text-foreground hover:border-zinc-500"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <input
        value={draftNote}
        onChange={(e) => setDraftNote(e.target.value)}
        placeholder="Optional note (what happened)..."
        className="w-full h-7 rounded-md border border-zinc-800 bg-secondary/40 px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/40"
      />
      {outcome && (
        <p className="text-[10px] text-muted-foreground/70">
          Outcome recorded — Sam factors this into their next plan.
        </p>
      )}
    </div>
  );
}