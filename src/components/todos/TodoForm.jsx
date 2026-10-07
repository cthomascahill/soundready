import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import VoiceButton from "@/components/VoiceButton";

// Add anything to this week's list — one line per thing Sam should stay on you about.
export default function TodoForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dictating, setDictating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t || saving) return;
    setSaving(true);
    await onAdd(t, notes.trim());
    setTitle("");
    setNotes("");
    setShowNotes(false);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a to-do for this week, e.g. Follow up with Lost Lake about the May date…"
          className={dictating ? "border-primary/50 ring-1 ring-ring" : undefined}
        />
        <VoiceButton
          onText={(text) => setTitle((prev) => (prev ? `${prev} ${text}` : text))}
          onListeningChange={setDictating}
        />
        <Button type="submit" disabled={!title.trim() || saving} className="gap-1.5 font-semibold shrink-0">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </div>
      {showNotes ? (
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional details — links, numbers, context Sam should remember"
          rows={2}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowNotes(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          + Add details
        </button>
      )}
    </form>
  );
}