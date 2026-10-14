import { useRef, useState } from "react";
import { FolderUp, Music2 } from "lucide-react";
import { isAudioFile } from "@/lib/audioFiles";

// The single entry point for music: drop a folder, pick files, and SAM
// organizes them. Compact once the vault has songs so it never competes
// with the library for attention.
export default function FolderDropZone({ onFiles, disabled, compact }) {
  const [dragging, setDragging] = useState(false);
  const folderRef = useRef(null);
  const fileRef = useRef(null);

  const handle = (list) => {
    if (disabled) return;
    const audio = Array.from(list).filter(isAudioFile);
    if (audio.length) onFiles(audio);
  };

  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

  const pickFiles = (e) => { e.stopPropagation(); fileRef.current?.click(); };
  const pickFolder = (e) => { e.stopPropagation(); folderRef.current?.click(); };

  const border = disabled
    ? "opacity-60 border-border"
    : dragging
      ? "border-primary bg-primary/5"
      : "border-border hover:border-primary/40";

  return (
    <div
      onDragOver={(e) => { stop(e); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { stop(e); setDragging(false); handle(e.dataTransfer.files); }}
      className={`relative rounded-2xl border-2 border-dashed transition-all ${border}`}
    >
      {compact ? (
        <div className="flex items-center gap-3 px-4 py-3">
          <FolderUp className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground flex-1 min-w-0 truncate">
            {dragging ? "Drop to organize with SAM" : "Drop more music here anytime"}
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={pickFiles}
              disabled={disabled}
              className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Add Song
            </button>
            <button
              onClick={pickFolder}
              disabled={disabled}
              className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors disabled:opacity-50"
            >
              Folder
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center">
            <Music2 className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <p className="font-heading text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              Drop your music folder.
            </p>
            <p className="text-sm text-muted-foreground">
              SAM sorts everything into songs and versions, no tagging, no forms.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            <button
              onClick={pickFolder}
              disabled={disabled}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <FolderUp className="h-4 w-4" /> Choose folder
            </button>
            <button
              onClick={pickFiles}
              disabled={disabled}
              className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors disabled:opacity-50"
            >
              Choose files
            </button>
          </div>
        </div>
      )}

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