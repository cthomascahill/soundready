import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useDebouncedField from "@/hooks/useDebouncedField";
import AudioCell from "./AudioCell";
import ArtworkCell from "./ArtworkCell";
import DetailField from "./DetailField";
import StageProgress from "./StageProgress";
import VersionsPanel from "./VersionsPanel";

const fieldBox = "min-h-9 flex items-center rounded-md border border-border bg-secondary/30 px-3 py-0.5";

// Everything about a song that doesn't belong in the collapsed row
export default function SongDetails({ song, onUpdate }) {
  const save = (field) => (val) => onUpdate(song.id, { [field]: val });
  const [version, setVersion] = useDebouncedField(song.audio_version_label, save("audio_version_label"));
  const [isrc, setIsrc] = useDebouncedField(song.isrc_code, save("isrc_code"));
  const [upc, setUpc] = useDebouncedField(song.upc_code, save("upc_code"));
  const [notes, setNotes] = useDebouncedField(song.notes, save("notes"));

  return (
    <div className="px-4 md:px-10 pb-5 pt-3 space-y-5 bg-secondary/10">
      <DetailField label="Workflow progress">
        <StageProgress song={song} onToggle={(key, val) => onUpdate(song.id, { [key]: val })} />
      </DetailField>

      <div className="grid gap-4 md:grid-cols-3">
        <DetailField label="Latest mix">
          <div className={fieldBox}>
            <AudioCell song={song} onUpdate={onUpdate} className="w-auto justify-start" />
          </div>
        </DetailField>
        <DetailField label="Artwork">
          <div className={fieldBox}>
            <ArtworkCell song={song} onUpdate={onUpdate} className="w-auto justify-start" />
          </div>
        </DetailField>
        <DetailField label="Release date">
          <Input
            type="date"
            value={song.release_date || ""}
            onChange={(e) => onUpdate(song.id, { release_date: e.target.value })}
            className="bg-secondary/30"
          />
        </DetailField>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DetailField label="Mix version label">
          <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="e.g. MIX 5" className="bg-secondary/30" />
        </DetailField>
        <DetailField label="ISRC">
          <Input value={isrc} onChange={(e) => setIsrc(e.target.value)} placeholder="CC-XXX-YY-NNNNN" className="bg-secondary/30" />
        </DetailField>
        <DetailField label="UPC / Barcode">
          <Input value={upc} onChange={(e) => setUpc(e.target.value)} placeholder="UPC / Barcode" className="bg-secondary/30" />
        </DetailField>
      </div>

      <DetailField label="Notes">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." rows={3} className="bg-secondary/30 resize-none" />
      </DetailField>

      <DetailField label="Versions — every mix and master of this record">
        <VersionsPanel song={song} onUpdate={onUpdate} />
      </DetailField>
    </div>
  );
}