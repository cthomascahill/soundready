import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { isAudioFile } from "@/lib/audioFiles";

// Slim drop band: drag a song anywhere onto it (or click to browse) and Sam takes over
export default function DropSongZone({ onFiles }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handle = (fileList) => {
    const audio = Array.from(fileList).filter(isAudioFile);
    if (audio.length) onFiles(audio);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={`flex items-center justify-center gap-3 h-20 rounded-2xl border-2 border-dashed cursor-pointer transition-all
        ${dragging ? "border-primary bg-primary/10 scale-[1.005]" : "border-border hover:border-primary/40 hover:bg-secondary/40"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.aac,.flac,.m4a"
        multiple
        className="hidden"
        onChange={(e) => { handle(e.target.files); e.target.value = ""; }}
      />
      <Upload className="h-4 w-4 text-primary shrink-0" />
      <p className="text-sm text-muted-foreground">
        <span className="text-foreground font-medium">Drop a song</span> — Sam files it, or{" "}
        <span className="underline underline-offset-2">browse</span>
      </p>
    </div>
  );
}