import { MoreHorizontal, Trash2, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Three-dot menu on a song row: finish the next step quickly, or delete the song
export default function SongRowMenu({ nextStage, onAdvance, onDelete }) {
  return (
    // Stops menu clicks from toggling the row open/closed
    <div className="w-8 shrink-0 flex justify-center" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Song actions"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {nextStage && (
            <>
              <DropdownMenuItem onSelect={() => onAdvance(nextStage.key)}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Mark {nextStage.label} as done
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Delete song
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}