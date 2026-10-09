import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Play, Pause, Download, Star, Trash2, Loader2, Columns3, Maximize2 } from "lucide-react";
import { resolvePlayableAudioUrl } from "@/lib/audioPlayback";
import VersionCompare from "./VersionCompare";

// Every version of one song — Mix V1, Mix V2, Master V1, Final Master —
// stored under the same record instead of duplicate songs.
export default function VersionsPanel({ song, onUpdate }) {
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    base44.entities.SongVersion.filter({ pipeline_song_id: song.id }, "-created_date", 50)
      .then(setVersions)
      .catch(() => {});
  }, [song?.id]);

  // A mix saved anywhere (the A/B player, another view) shows up here live — no refresh needed
  useEffect(() => {
    if (!song?.id) return undefined;
    const unsub = base44.entities.SongVersion.subscribe(() => {
      base44.entities.SongVersion.filter({ pipeline_song_id: song.id }, "-created_date", 50)
        .then(setVersions)
        .catch(() => {});
    });
    return unsub;
  }, [song?.id]);

  const makeLatest = async (v) => {
    await base44.entities.SongVersion.updateMany(
      { pipeline_song_id: song.id, is_current: true },
      { $set: { is_current: false } }
    ).catch(() => {});
    await base44.entities.SongVersion.update(v.id, { is_current: true });
    setVersions(prev => prev.map(x => ({ ...x, is_current: x.id === v.id })));
    // Keep the song row's "latest mix" cell in sync with this version
    await onUpdate(song.id, { audio_file_uri: v.file_uri, audio_version_label: v.label });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const created = await base44.entities.SongVersion.create({
        pipeline_song_id: song.id,
        song_title: song.song_name,
        label: label.trim() || `Version ${versions.length + 1}`,
        file_uri: file_uri,
        is_current: false,
      });
      setLabel("");
      setVersions(prev => [created, ...prev]);
      await makeLatest(created);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const togglePlay = async (v) => {
    if (playingId === v.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: v.file_uri,
      expires_in: 3600,
    });
    if (audioRef.current) {
      audioRef.current.src = await resolvePlayableAudioUrl(signed_url);
      try { await audioRef.current.play(); setPlayingId(v.id); } catch { setPlayingId(null); }
    }
  };

  const download = async (v) => {
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: v.file_uri,
      expires_in: 3600,
    });
    const a = document.createElement("a");
    a.href = signed_url;
    a.download = `${song.song_name} - ${v.label}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const remove = async (id) => {
    await base44.entities.SongVersion.delete(id);
    setVersions(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-2">
      {versions.map(v => (
        <div key={v.id} className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
          <button
            onClick={() => togglePlay(v)}
            className="h-7 w-7 rounded-full bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shrink-0"
            title={playingId === v.id ? "Pause" : "Play"}
          >
            {playingId === v.id ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>
          <span className="text-sm font-medium truncate flex-1 min-w-0 flex items-center gap-1.5">
            {v.label}
            {v.is_current && (
              <span className="text-[9px] font-bold uppercase text-primary bg-primary/10 border border-primary/25 px-1.5 py-0.5 rounded-full shrink-0">
                Latest
              </span>
            )}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:block">
            {v.created_date ? new Date(v.created_date).toLocaleDateString() : ""}
          </span>
          {!v.is_current && (
            <button onClick={() => makeLatest(v)} title="Make this the latest version"
              className="text-muted-foreground/40 hover:text-primary shrink-0">
              <Star className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={() => download(v)} title="Download this version"
            className="text-muted-foreground/40 hover:text-primary shrink-0">
            <Download className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => remove(v.id)} title="Delete this version"
            className="text-muted-foreground/40 hover:text-destructive shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {versions.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No versions yet. Upload your first mix below — every version of this record lives here.
        </p>
      )}
      <div className="flex items-center gap-2">
        {versions.length > 1 && (
          <button onClick={() => setCompareOpen(true)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-primary/30 text-primary text-sm font-semibold shrink-0 hover:bg-primary/10">
            <Columns3 className="h-4 w-4" /> Compare
          </button>
        )}
        <button onClick={() => navigate(`/song-versions/${song.id}`)}
          title="Open the full version history view"
          className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-border text-zinc-400 text-sm font-medium shrink-0 hover:text-white hover:border-zinc-600">
          <Maximize2 className="h-4 w-4" /> Full View
        </button>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={versions.length ? "e.g. Mix V2, Master V1..." : "e.g. Mix V1..."}
          className="flex-1 min-w-0 h-9 rounded-md border border-border bg-secondary/30 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold shrink-0 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Upload Version
        </button>
      </div>
      <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={handleUpload} />
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} onPause={() => setPlayingId(null)} className="hidden" />
      <VersionCompare
        song={song}
        versions={versions}
        open={compareOpen}
        onOpenChange={setCompareOpen}
        onMakeLatest={makeLatest}
        onRemove={remove}
      />
    </div>
  );
}