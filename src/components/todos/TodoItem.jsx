import { useState } from "react";
import { Check, Trash2, GripVertical, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { POINTS_TABLE } from "@/lib/awardPoints";

// One to-do row. Checking it off earns Sound Ready Points; the pencil
// turns the row into an inline edit for the title and notes.
export default function TodoItem({ todo, onToggle, onDelete, onEdit, handleProps }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [notes, setNotes] = useState(todo.notes || "");
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setTitle(todo.title);
    setNotes(todo.notes || "");
    setEditing(true);
  };

  const save = async () => {
    const t = title.trim();
    if (!t || saving) return;
    setSaving(true);
    await onEdit(todo.id, t, notes.trim());
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-primary/40 bg-card p-3.5">
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            aria-label="Edit to-do title"
          />
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional details, links, numbers, context Sam should remember"
            rows={2}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={save} disabled={!title.trim() || saving} className="font-semibold">
            Save
          </Button>
          <button
            onClick={() => setEditing(false)}
            aria-label="Cancel edit"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-start gap-3 rounded-xl border p-3.5 transition-colors ${
        todo.done ? "bg-secondary/40 border-border" : "bg-card border-border hover:border-primary/30"
      }`}
    >
      {handleProps && (
        <button
          {...handleProps}
          aria-label="Drag to reorder"
          className="mt-0.5 shrink-0 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => onToggle(todo)}
        aria-label={todo.done ? "Mark as not done" : "Check off"}
        className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border flex items-center justify-center transition-colors ${
          todo.done
            ? "bg-primary border-primary text-primary-foreground"
            : "border-input hover:border-primary"
        }`}
      >
        {todo.done && <Check className="h-3.5 w-3.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium leading-snug ${todo.done ? "line-through text-muted-foreground" : ""}`}>
          {todo.title}
        </p>
        {todo.notes && (
          <p className="text-xs text-muted-foreground/80 mt-1 leading-relaxed whitespace-pre-wrap">{todo.notes}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {todo.done && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
            +{POINTS_TABLE.todo_done} pts
          </span>
        )}
        <button
          onClick={startEdit}
          aria-label="Edit to-do"
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          aria-label="Delete to-do"
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}