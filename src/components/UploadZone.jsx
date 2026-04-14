import { useState, useRef } from "react";
import { Upload, Music, X, CheckCircle2 } from "lucide-react";

export default function UploadZone({ file, onFileSelect, onClear }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileSelect(dropped);
  };

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (selected) onFileSelect(selected);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
      className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
        ${isDragging ? "border-primary bg-primary/10 scale-[1.01]" : file ? "border-primary/40 bg-primary/5 cursor-default" : "border-border hover:border-primary/40 hover:bg-secondary/40"}`}
    >
      <input ref={inputRef} type="file" accept=".mp3,.wav,.aac,.flac,audio/*" onChange={handleChange} className="hidden" />

      <div className="px-6 py-7 flex flex-col items-center text-center gap-3">
        {file ? (
          <>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-heading font-semibold text-sm">Drop your track here</p>
              <p className="text-xs text-muted-foreground mt-1">MP3, WAV, AAC, FLAC — up to 50MB</p>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground font-medium">Browse files</span>
          </>
        )}
      </div>
    </div>
  );
}