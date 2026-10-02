import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STAGES } from "@/lib/songStages";

const OPTIONS = [
  { value: "all", label: "All stages" },
  { value: "none", label: "Not Started" },
  ...STAGES.map((s) => ({ value: s.key, label: s.status })),
];

// Separate control for narrowing the list to songs currently at one workflow stage
export default function StageFilter({ value, onChange }) {
  const active = value !== "all";
  const activeLabel = OPTIONS.find((o) => o.value === value)?.label;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`gap-2 ${active ? "border-primary/50 text-primary" : ""}`}>
            <Filter className="h-3.5 w-3.5" />
            {active ? `Stage: ${activeLabel}` : "Filter"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Filter by current stage</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {OPTIONS.map((o) => (
              <DropdownMenuRadioItem key={o.value} value={o.value}>
                {o.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {active && (
        <button
          type="button"
          onClick={() => onChange("all")}
          aria-label="Clear stage filter"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}