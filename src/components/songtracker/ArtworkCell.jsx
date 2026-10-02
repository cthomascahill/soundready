import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Loader2 } from "lucide-react";

/**
 * Artwork column for a Song Tracker row: thumbnail preview,
 * click to download for the distributor handoff, replace via upload.
 */
export default function ArtworkCell({ song, onUpdate }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [artUrl, setArtUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setArtUrl(null);
    if (song.artwork_file_uri) {
      base44.integrations.Core.CreateFileSignedUrl({
        file_uri: song.artwork_file_uri,
        expires_in: 3600,
      }).then(({ signed_url }) => {
        if (!cancelled) setArtUrl(signed_url);
      });
    }
    return () => { cancelled = true; };
  }, [song.artwork_file_uri]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await onUpdate(song.id, { artwork_file_uri: file_uri });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const downloadArtwork = () => {
    if (!artUrl) return;
    const a = document.createElement("a");
    a.href = artUrl;
    a.download = `${song.song_name} - Artwork`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="w-20 shrink-0 px-2 flex items-center justify-center gap-1">
      {uploading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      ) : artUrl ? (
        <>
          <img
            src={artUrl}
            alt={`${song.song_name} artwork`}
            onClick={downloadArtwork}
            className="h-8 w-8 rounded object-cover border border-border cursor-pointer hover:border-primary/50 transition-colors"
            title="Download artwork"
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="text-muted-foreground/40 hover:text-primary transition-colors shrink-0"
            title="Replace artwork"
          >
            <Upload className="h-3 w-3" />
          </button>
        </>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
          title="Upload artwork"
        >
          <Upload className="h-3 w-3" /> Art
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}