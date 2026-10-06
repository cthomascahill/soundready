import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { isAudioFile } from "@/lib/audioFiles";

// Whole page becomes a drop target: shows a big overlay while a file is being dragged
export default function PageDropOverlay({ onFiles }) {
  const [dragging, setDragging] = useState(false);
  const cbRef = useRef(onFiles);
  useEffect(() => { cbRef.current = onFiles; });

  useEffect(() => {
    let depth = 0;
    const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes("Files");
    const onEnter = (e) => { if (hasFiles(e)) { depth += 1; setDragging(true); } };
    const onLeave = () => { depth = Math.max(0, depth - 1); if (!depth) setDragging(false); };
    const onOver = (e) => { if (hasFiles(e)) e.preventDefault(); };
    const onDrop = (e) => {
      e.preventDefault();
      depth = 0;
      setDragging(false);
      const audio = Array.from(e.dataTransfer?.files || []).filter(isAudioFile);
      if (audio.length) cbRef.current(audio);
    };
    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("dragover", onOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  if (!dragging) return null;
  return (
    <div className="fixed inset-0 z-40 bg-primary/10 backdrop-blur-[2px] pointer-events-none flex items-center justify-center p-6">
      <div className="rounded-2xl border-2 border-dashed border-primary bg-card/95 px-10 py-8 flex flex-col items-center gap-2 shadow-2xl">
        <Upload className="h-8 w-8 text-primary" />
        <p className="font-heading font-bold text-lg">Drop it — Sam will file it</p>
        <p className="text-xs text-muted-foreground">Name it, pick a stage, done.</p>
      </div>
    </div>
  );
}