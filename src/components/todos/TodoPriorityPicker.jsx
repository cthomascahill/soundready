import { priorityOf } from "./TodoPriorityBadge";

const OPTIONS = [
  { value: "high", selected: "bg-red-500/15 border-red-500/40 text-red-400" },
  { value: "medium", selected: "bg-yellow-500/15 border-yellow-500/40 text-yellow-400" },
  { value: "low", selected: "bg-green-500/15 border-green-500/40 text-green-400" },
];

// High / Medium / Low segmented picker used when adding or editing a to-do.
export default function TodoPriorityPicker({ value, onChange }) {
  const current = priorityOf(value);
  return (
    <div className="flex items-center gap-1.5">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wide transition-colors ${
            current === o.value ? o.selected : "border-border text-muted-foreground/60 hover:text-foreground"
          }`}
        >
          {o.value}
        </button>
      ))}
    </div>
  );
}