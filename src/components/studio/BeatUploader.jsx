import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Music, Upload, X, Play, Pause } from "lucide-react";

export default function BeatUploader({ beatFile, setBeatFile, onBpmDetected }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const inputRef = useRef(null);
  const audioRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("audio/")) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const localUrl = URL.createObjectURL(file);
    setBeatFile({ name: file.name, url: file_url, localUrl, size: file.size });
    setUploading(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const remove = () => {
    if (audioRef.current) { audioRef.current.pause(); }
    setPlaying(false);
    setBeatFile(null);
  };

  const formatSize = (b) => b > 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : `${Math.round(b / 1000)} KB`;

  if (beatFile) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center gap-3">
        <button onClick={togglePlay}
          className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors shrink-0">
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white truncate">{beatFile.name}</p>
          <p className="text-[10px] text-zinc-500">{formatSize(beatFile.size)} · Beat loaded</p>
        </div>
        <button onClick={remove} className="text-zinc-500 hover:text-red-400 transition-colors shrink-0">
          <X className="h-4 w-4" />
        </button>
        <audio ref={audioRef} src={beatFile.localUrl} onEnded={() => setPlaying(false)} />
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs text-zinc-400 mb-1.5 block">Beat / Instrumental</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 py-5 px-4 text-center ${
          dragging ? "border-primary bg-primary/10" : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/40"
        }`}
      >
        {uploading ? (
          <>
            <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-zinc-400">Uploading beat...</p>
          </>
        ) : (
          <>
            <Music className={`h-5 w-5 ${dragging ? "text-primary" : "text-zinc-500"}`} />
            <p className="text-xs text-zinc-400">Drop your beat here</p>
            <p className="text-[10px] text-zinc-600">MP3, WAV, FLAC · The AI will use this as context</p>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
    </div>
  );
}