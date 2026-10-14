import { useRef, useState } from "react";
import { FolderUp } from "lucide-react";
import { isAudioFile } from "@/lib/audioFiles";

// The folder-first entry: drop an entire music folder (or pick one) and
// SAM organizes it — no per-song tagging, no forms.
export default function FolderDropZone({ onFiles, disabled }) {
  const [dragging, setDragging] = useState(false);
  const folderRef = useRef(null);
  const fileRef = useRef(null);

  const handle = (list) => {
    if (disabled) return;
    const audio = Array.from(list).filter(isAudioFile);
    if (audio.length) onFiles(audio);
  };

  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <div
      onDragOver={(e) => { stop(e); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { stop(e); setDragging(false); handle(e.dataTransfer.files); }}
      className={`relative rounded-2xl border-2 border-dashed transition-all ${
        disabled ? "opacity-60 border-border" : dragging ? "border-primary bg-primary/10 scale-[1.005]" : "border-border hover:border-primary/40"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-2.5 px-6 py-12 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center">
          <FolderUp className="h-7 w-7 text-primary" />
        </div>
        <p className="font-heading text-2xl sm:text-3xl font-bold text-foreground leading-tight">
          Drop your whole music folder.
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          No tagging, no forms. SAM groups versions of the same song, finds
          exact duplicates and files everything — anything unclear waits for
          your review.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          <button
            onClick={() => folderRef.current?.click()}
            disabled={disabled}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <FolderUp className="h-4 w-4" /> Choose folder
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors disabled:opacity-50"
          >
            Choose files
          </button>
        </div>
      </div>

      <input
        ref={folderRef}
        type="file"
        multiple
        webkitdirectory=""
        directory=""
        className="hidden"
        onChange={(e) => { handle(e.target.files); e.target.value = ""; }}
      />
      <input
        ref={fileRef}
        type="file"
        accept="audio/*,.mp3,.wav,.aac,.flac,.m4a"
        multiple
        className="hidden"
        onChange={(e) => { handle(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
}