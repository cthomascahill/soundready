import { useState, useRef } from "react";
import { Upload, Music, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadZone({ onFileSelect, file, onClear }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const ALLOWED = ["audio/mpeg", "audio/mp3", "audio/aac", "audio/x-m4a", "audio/mp4", "audio/ogg"];

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && ALLOWED.includes(droppedFile.type)) {
      onFileSelect(droppedFile);
    } else if (droppedFile) {
      alert("Only MP3, AAC, and M4A files are supported. WAV and FLAC are not.");
    }
  };

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (selected) onFileSelect(selected);
  };

  return (
    <div
      onDragOver={handleDrag}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
        isDragging
          ? "border-primary bg-primary/10 scale-[1.02]"
          : file
          ? "border-primary/30 bg-primary/5"
          : "border-border hover:border-primary/40 hover:bg-secondary/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".mp3,.aac,.m4a,.ogg"
        onChange={handleChange}
        className="hidden"
      />

      <div className="p-8 sm:p-12 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Music className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">
                  Drop your track here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  MP3, AAC, M4A — up to 50MB (WAV not supported)
                </p>
              </div>
              <div className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                Browse files
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}