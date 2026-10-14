import { useState } from "react";
import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ReviewRow({ item, busy, onConfirm, onDismiss }) {
  const [title, setTitle] = useState(item.suggested_title || "");

  return (
    <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/5 p-4 space-y-3">
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0" />
        <p className="text-sm truncate flex-1">{item.original_filename}</p>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {item.file_size ? `${(item.file_size / 1048576).toFixed(1)} MB` : ""}
        </span>
      </div>
      {item.reason && <p className="text-xs text-muted-foreground">{item.reason}</p>}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name this song" className="flex-1" />
        <Button size="sm" className="gap-1.5 shrink-0" disabled={!title.trim() || busy} onClick={() => onConfirm(item, title)}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Add as song
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 shrink-0" disabled={busy} onClick={() => onDismiss(item)}>
          <X className="h-3.5 w-3.5" /> Not a song
        </Button>
      </div>
    </div>
  );
}

// The files SAM couldn't confidently name — the artist settles each in seconds
export default function NeedsReviewList({ items, busyId, onConfirm, onDismiss, onCollapse }) {
  if (!items?.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-2 flex-wrap">
        <h2 className="font-heading text-xl font-bold">Needs review</h2>
        <span className="text-xs text-muted-foreground">
          {items.length} {items.length === 1 ? "file" : "files"} SAM wasn't sure about
        </span>
        {onCollapse && (
          <button onClick={onCollapse} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors">
            Hide
          </button>
        )}
      </div>
      {items.map((item) => (
        <ReviewRow key={item.id} item={item} busy={busyId === item.id} onConfirm={onConfirm} onDismiss={onDismiss} />
      ))}
    </section>
  );
}