import { useState } from "react";
import { ChevronDown, Headphones } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useDebouncedField from "@/hooks/useDebouncedField";
import ArtworkCell from "./ArtworkCell";
import DetailField from "./DetailField";
import StageProgress from "./StageProgress";
import VersionsPanel from "./VersionsPanel";
import AudioReviewPlayer from "./AudioReviewPlayer";

// The song's working surface, in the order an artist cares: the audio and its
// versions first, then the workflow paperwork, then notes. Codes and dates
// wait behind "More details".
export default function SongDetails({ song, onUpdate }) {
  const save = (field) => (val) => onUpdate(song.id, { [field]: val });
  const [notes, setNotes] = useDebouncedField(song.notes, save("notes"));
  const [version, setVersion] = useDebouncedField(song.audio_version_label, save("audio_version_label"));
  const [isrc, setIsrc] = useDebouncedField(song.isrc_code, save("isrc_code"));
  const [upc, setUpc] = useDebouncedField(song.upc_code, save("upc_code"));
  const [moreOpen, setMoreOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <div className="space-y-6">
      <DetailField label="Audio & versions">
        <div className="space-y-3">
          <button
            onClick={() => setReviewOpen(true)}
            className="h-9 px-4 rounded-md border border-border text-xs font-semibold tracking-wide flex items-center gap-2 hover:bg-secondary transition-colors"
          >
            <Headphones className="h-4 w-4" /> A/B compare mixes
          </button>
          <VersionsPanel song={song} onUpdate={onUpdate} />
        </div>
      </DetailField>

      <DetailField label="Workflow progress">
        <StageProgress song={song} onToggle={(key, val) => onUpdate(song.id, { [key]: val })} />
      </DetailField>

      <DetailField label="Notes">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." rows={3} className="resize-none" />
      </DetailField>

      <button
        type="button"
        onClick={() => setMoreOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
        {moreOpen ? "Hide details" : "More details"}
      </button>

      {moreOpen && (
        <div className="space-y-5 rounded-xl border border-border p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <DetailField label="Artwork">
              <div className="min-h-9 flex items-center rounded-md border border-border bg-secondary/30 px-3 py-0.5">
                <ArtworkCell song={song} onUpdate={onUpdate} className="w-auto justify-start" />
              </div>
            </DetailField>
            <DetailField label="Release date">
              <Input
                type="date"
                value={song.release_date || ""}
                onChange={(e) => onUpdate(song.id, { release_date: e.target.value })}
              />
            </DetailField>
            <DetailField label="Mix version label">
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="e.g. MIX 5" />
            </DetailField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailField label="ISRC">
              <Input value={isrc} onChange={(e) => setIsrc(e.target.value)} placeholder="CC-XXX-YY-NNNNN" />
            </DetailField>
            <DetailField label="UPC / Barcode">
              <Input value={upc} onChange={(e) => setUpc(e.target.value)} placeholder="UPC / Barcode" />
            </DetailField>
          </div>
        </div>
      )}

      <AudioReviewPlayer
        song={song}
        onUpdate={onUpdate}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
      />
    </div>
  );
}