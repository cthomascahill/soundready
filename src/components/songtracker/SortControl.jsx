import { ArrowUpDown } from "lucide-react";
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

const KEYS = [
  { value: "default", label: "Needs action first" },
  { value: "name", label: "Song Name" },
  { value: "stage", label: "Current Stage" },
  { value: "next", label: "Next Action" },
  { value: "release_date", label: "Release Date" },
];

// Sort control for small screens, where the column headers aren't visible
export default function SortControl({ sort, onChange }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpDown className="h-3.5 w-3.5" /> Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={sort.key || "default"}
          onValueChange={(v) => onChange({ key: v === "default" ? null : v, dir: sort.dir })}
        >
          {KEYS.map((k) => (
            <DropdownMenuRadioItem key={k.value} value={k.value}>{k.label}</DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {sort.key && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sort.dir} onValueChange={(dir) => onChange({ ...sort, dir })}>
              <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}