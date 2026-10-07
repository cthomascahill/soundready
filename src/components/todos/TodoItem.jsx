import { Check, Trash2 } from "lucide-react";
import { POINTS_TABLE } from "@/lib/awardPoints";

// One to-do row. Checking it off earns Sound Ready Points; unchecking just edits.
export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div
      className={`group flex items-start gap-3 rounded-xl border p-3.5 transition-colors ${
        todo.done ? "bg-secondary/40 border-border" : "bg-card border-border hover:border-primary/30"
      }`}
    >
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