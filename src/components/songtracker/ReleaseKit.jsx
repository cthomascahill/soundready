import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Download, Loader2 } from "lucide-react";

/**
 * Release kit for a Song Tracker row: release date, artwork upload
 * with preview, and download buttons for the mix and artwork so
 * everything can be handed off to a distributor.
 */
export default function ReleaseKit({ song, onUpdate }) {
  const artInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [artUrl, setArtUrl] = useState(null);
  const [mixUrl, setMixUrl] = useState(null);
  const [loadingMix, setLoadingMix] = useState(false);

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

  const handleArtworkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await onUpdate(song.id, { artwork_file_uri: file_uri });
    } finally {
      setUploading(false);
      if (artInputRef.current) artInputRef.current.value = "";
    }
  };

  const downloadFile = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadMix = async () => {
    let url = mixUrl;
    if (!url) {
      setLoadingMix(true);
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: song.audio_file_uri,
        expires_in: 3600,
      });
      setMixUrl(signed_url);
      url = signed_url;
      setLoadingMix(false);
    }
    downloadFile(url, `${song.song_name} - ${song.audio_version_label || "Mix"}`);
  };

  const downloadArtwork = () => {
    if (artUrl) downloadFile(artUrl, `${song.song_name} - Artwork`);
  };

  return (
    <div className="flex flex-wrap items-end gap-4 mt-3 pt-3 border-t border-border/60">
      {/* Release date */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">
          Release Date
        </label>
        <input
          type="date"
          value={song.release_date || ""}
          onChange={(e) => onUpdate(song.id, { release_date: e.target.value })}
          className="bg-secondary/30 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Artwork */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">
          Artwork
        </label>
        <div className="flex items-center gap-2">
          {uploading ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground h-11">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading
            </span>
          ) : artUrl ? (
            <>
              <img
                src={artUrl}
                alt={`${song.song_name} artwork`}
                className="h-11 w-11 rounded-md object-cover border border-border"
              />
              <button
                onClick={downloadArtwork}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                title="Download artwork"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
              <button
                onClick={() => artInputRef.current?.click()}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                title="Replace artwork"
              >
                <Upload className="h-3.5 w-3.5" /> Replace
              </button>
            </>
          ) : (
            <button
              onClick={() => artInputRef.current?.click()}
              className="flex items-center gap-1.5 h-11 px-3 rounded-lg border border-dashed border-border text-[11px] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" /> Upload Artwork
            </button>
          )}
        </div>
      </div>

      {/* Download the mix */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">
          Distributor Handoff
        </label>
        <button
          onClick={downloadMix}
          disabled={!song.audio_file_uri}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary/15 border border-primary/25 text-primary text-[11px] font-medium hover:bg-primary/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title={song.audio_file_uri ? "Download the latest mix" : "Upload a mix first"}
        >
          {loadingMix ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Download Mix
        </button>
      </div>

      <input
        ref={artInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleArtworkUpload}
      />
    </div>
  );
}