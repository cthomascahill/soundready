import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Play, Pause, Download, Star, Trash2, Loader2 } from "lucide-react";

/**
 * Version files for one client song — upload mixes/masters, play the
 * latest, star the current version, download or remove.
 */
export default function VersionsList({ song }) {
  const [versions, setVersions] = useState(null);
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    setVersions(null);
    base44.entities.ClientSongVersion.filter({ song_id: song.id }, "-created_date", 50)
      .then(setVersions)
      .catch(() => setVersions([]));
  }, [song.id]);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const created = await base44.entities.ClientSongVersion.create({
        song_id: song.id,
        label: label.trim() || `V${(versions?.length || 0) + 1}`,
        file_uri,
        is_current: !versions || versions.length === 0,
      });
      setVersions((v) => [created, ...(v || [])]);
      setLabel("");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const signedUrl = (v) =>
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: v.file_uri, expires_in: 3600 }).then(
      (r) => r.signed_url
    );

  const play = async (v) => {
    if (playing?.id === v.id) {
      setPlaying(null);
      return;
    }
    const url = await signedUrl(v);
    setPlaying({ id: v.id, url });
  };

  const download = async (v) => {
    const url = await signedUrl(v);
    window.open(url, "_blank");
  };

  const setCurrent = async (v) => {
    setBusyId(v.id);
    try {
      await base44.entities.ClientSongVersion.bulkUpdate(
        versions.map((x) => ({ id: x.id, is_current: x.id === v.id }))
      );
      setVersions((prev) => prev.map((x) => ({ ...x, is_current: x.id === v.id })));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (v) => {
    if (!window.confirm(`Delete version "${v.label}"?`)) return;
    setBusyId(v.id);
    try {
      await base44.entities.ClientSongVersion.delete(v.id);
      setVersions((prev) => prev.filter((x) => x.id !== v.id));
      if (playing?.id === v.id) setPlaying(null);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2.5">
      <div className="flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={versions?.length ? "Label, e.g. Mix V2…" : "Label, e.g. Rough Demo…"}
          className="flex-1 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold flex items-center gap-1.5 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          {uploading ? "Uploading…" : "Upload Version"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => upload(e.target.files[0])}
        />
      </div>

      {playing && (
        <audio controls autoPlay src={playing.url} className="w-full" onPause={() => setPlaying(null)} onEnded={() => setPlaying(null)} />
      )}

      {versions === null ? (
        <div className="flex justify-center py-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      ) : versions.length === 0 ? (
        <p className="text-[11px] text-muted-foreground/70 text-center py-1.5">
          No versions uploaded yet.
        </p>
      ) : (
        <div className="space-y-1.5">
          {versions.map((v) => (
            <div key={v.id} className="flex items-center gap-2 rounded-lg bg-secondary/40 border border-border px-2.5 py-1.5">
              <span className="text-[11px] font-semibold flex-1 truncate">
                {v.label}
                {v.is_current && (
                  <span className="ml-1.5 text-[9px] uppercase tracking-wider text-primary font-bold">current</span>
                )}
              </span>
              <button
                onClick={() => play(v)}
                className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                title={playing?.id === v.id ? "Stop" : "Play"}
              >
                {playing?.id === v.id ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </button>
              <button
                onClick={() => download(v)}
                className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                title="Download"
              >
                <Download className="h-3 w-3" />
              </button>
              <button
                onClick={() => setCurrent(v)}
                disabled={busyId === v.id || v.is_current}
                className={`h-6 w-6 rounded-md flex items-center justify-center transition-colors ${
                  v.is_current ? "text-primary" : "text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10"
                }`}
                title="Set as current version"
              >
                <Star className="h-3 w-3" />
              </button>
              <button
                onClick={() => remove(v)}
                disabled={busyId === v.id}
                className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Delete version"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}