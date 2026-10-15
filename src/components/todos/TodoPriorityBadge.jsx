// Colors for each priority level, shared by the badge and the picker.
export const PRIORITY_STYLES = {
  high: { label: "High", dot: "bg-red-500", text: "text-red-400" },
  medium: { label: "Medium", dot: "bg-yellow-500", text: "text-yellow-400" },
  low: { label: "Low", dot: "bg-green-500", text: "text-green-400" },
};

// Old to-dos created before priorities existed have none; they read as medium.
export const priorityOf = (p) => (PRIORITY_STYLES[p] ? p : "medium");

// Small colored dot + label next to a to-do.
export default function TodoPriorityBadge({ priority }) {
  const s = PRIORITY_STYLES[priorityOf(priority)];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${s.text}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}