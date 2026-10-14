import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { getCurrentStage } from "@/lib/songStatus";
import StageBadge from "./StageBadge";
import SongDetails from "./SongDetails";

// The side panel that opens when a row is clicked: everything about one song
export default function SongDetailsSheet({ song, onClose, onUpdate }) {
  const current = getCurrentStage(song);

  return (
    <Sheet open onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="w-full sm:max-w-2xl p-0 gap-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="font-heading text-xl font-bold">{song.song_name || "Untitled"}</SheetTitle>
          <SheetDescription>
            <StageBadge stage={current} />
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <SongDetails song={song} onUpdate={onUpdate} />
        </div>
      </SheetContent>
    </Sheet>
  );
}