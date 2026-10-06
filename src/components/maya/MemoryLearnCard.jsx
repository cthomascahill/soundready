import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Check, X, Loader2 } from "lucide-react";

/**
 * Shown in chat when Maya picks up a durable preference from the conversation.
 * The artist confirms (with edits) or rejects it before Maya remembers it.
 */
export default function MemoryLearnCard({ item, onConfirm, onDismiss }) {
  const [value, setValue] = useState(item.value);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try { await onConfirm(item, value.trim() || item.value); } finally { setBusy(false); }
  };

  const dismiss = async () => {
    setBusy(true);
    try { await onDismiss(item); } finally { setBusy(false); }
  };

  return (
    <div className="rounded-xl bg-primary/5 border border-primary/25 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
        <p className="text-[11px] font-semibold text-primary">
          Maya wants to remember this — edit it if she's off
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{item.key}</p>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-zinc-700 bg-zinc-900/70 px-2.5 py-1.5 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={confirm} disabled={busy} className="h-7 px-3 gap-1.5 font-semibold">
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Keep it
        </Button>
        <Button size="sm" variant="ghost" onClick={dismiss} disabled={busy}
          className="h-7 px-3 gap-1.5 text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" /> Not right
        </Button>
      </div>
    </div>
  );
}