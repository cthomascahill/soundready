import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pencil, Trash2, X } from "lucide-react";

/**
 * Lists a user's Sam memory entries for one category with inline edit and delete.
 */
export default function MemoryEntryList({ entries, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setDraft(entry.value);
  };

  const saveEdit = async (entry) => {
    const v = draft.trim();
    if (!v) return;
    await onUpdate(entry, v);
    setEditingId(null);
  };

  return (
    <div className="space-y-1.5">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-start gap-2 rounded-xl border border-border bg-secondary/30 px-3 py-2"
        >
          {editingId === entry.id ? (
            <>
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit(entry)}
                className="h-8 text-xs flex-1 bg-background"
                autoFocus
              />
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => saveEdit(entry)}>
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingId(null)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-foreground leading-relaxed flex-1 pt-0.5">{entry.value}</p>
              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => startEdit(entry)}>
                <Pencil className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => onDelete(entry)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}