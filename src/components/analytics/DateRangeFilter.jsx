import { Calendar } from "lucide-react";

const OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

export default function DateRangeFilter({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-card border border-border">
      <Calendar className="h-3.5 w-3.5 text-muted-foreground ml-2" />
      {OPTIONS.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`h-7 px-3 rounded-md text-xs font-medium transition-colors ${value === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}