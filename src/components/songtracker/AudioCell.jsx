import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Play, Pause, Upload, Download, Loader2 } from "lucide-react";

/**
 * Latest-mix audio for a Tracker row: upload the file,
 * play it inline, and replace it with a newer version.
 */
export default function AudioCell({ song, onUpdate, className = "w-28 shrink-0 px-2 justify-center" }) {
  const inputRef = useRef(null);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.removeAttribute("src"); }
      setPlaying(false);
      await onUpdate(song.id, { audio_file_uri: file_uri });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    if (!audioRef.current.src) {
      setLoadingUrl(true);
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: song.audio_file_uri,
        expires_in: 3600,
      });
      audioRef.current.src = signed_url;
      setLoadingUrl(false);
    }
    await audioRef.current.play();
    setPlaying(true);
  };

  const downloadMix = async () => {
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: song.audio_file_uri,
      expires_in: 3600,
    });
    const a = document.createElement("a");
    a.href = signed_url;
    a.download = `${song.song_name} - ${song.audio_version_label || "Mix"}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const hasAudio = !!song.audio_file_uri;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {uploading ? (
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Uploading
        </span>
      ) : hasAudio ? (
        <>
          <button
            onClick={togglePlay}
            className="h-7 w-7 rounded-full bg-primary/15 border border-primary/25 text-primary flex items-center justify-center hover:bg-primary/25 transition-colors shrink-0"
            title={playing ? "Pause latest mix" : "Play latest mix"}
          >
            {loadingUrl ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : playing ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 ml-0.5" />
            )}
          </button>
          <span className="text-[10px] font-semibold text-muted-foreground truncate">
            {song.audio_version_label || "Audio"}
          </span>
          <button
            onClick={() => inputRef.current?.click()}
            className="text-muted-foreground/40 hover:text-primary transition-colors shrink-0"
            title="Upload a newer version"
          >
            <Upload className="h-3 w-3" />
          </button>
          <button
            onClick={downloadMix}
            className="text-muted-foreground/40 hover:text-primary transition-colors shrink-0"
            title="Download the latest mix"
          >
            <Download className="h-3 w-3" />
          </button>
          <audio ref={audioRef} onEnded={() => setPlaying(false)} className="hidden" />
        </>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
          title="Upload the latest mix"
        >
          <Upload className="h-3 w-3" /> Upload
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}