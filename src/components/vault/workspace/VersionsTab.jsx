import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Upload, Play, Pause, Star, Loader2, Maximize2 } from "lucide-react";
import { resolveAudioSource } from "@/lib/audioPlayback";

function VersionRow({ version }) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  const toggle = async (e) => {
    e.stopPropagation();
    if (playing) { audioRef.current.pause(); setPlaying(false); return; }
    setLoading(true);
    try {
      audioRef.current.src = await resolveAudioSource(version.file_uri);
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2">
      <button
        onClick={toggle}
        title={`Play ${version.label}`}
        className="h-8 w-8 rounded-full bg-foreground/10 border border-foreground/15 flex items-center justify-center text-foreground hover:bg-foreground/20 transition-colors shrink-0"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
      </button>
      <span className="text-sm flex-1 min-w-0 truncate">{version.label}</span>
      {version.is_current && (
        <span className="text-[10px] font-semibold text-foreground flex items-center gap-1 shrink-0">
          <Star className="h-3 w-3 fill-foreground" /> Current
        </span>
      )}
      <audio ref={audioRef} onEnded={() => setPlaying(false)} />
    </div>
  );
}

// The song's audio and versions, first thing on opening a song. Every mix and
// master SAM grouped under this song, playable in place, with the full
// side-by-side version history one click away.
export default function VersionsTab({ song, pipeline, hasAudio, onAudioUploaded }) {
  const isNew = !song?.id;
  const [versions, setVersions] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!pipeline?.id) { setVersions([]); return undefined; }
    const load = () => base44.entities.SongVersion.filter({ pipeline_song_id: pipeline.id }, "-created_date", 50)
      .then(setVersions)
      .catch(() => {});
    load();
    return base44.entities.SongVersion.subscribe(load);
  }, [pipeline?.id]);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("audio/")) return;
    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    const duration = await new Promise((resolve) => {
      const a = new Audio();
      a.src = localUrl;
      a.onloadedmetadata = () => resolve(Math.round(a.duration));
      a.onerror = () => resolve(null);
      setTimeout(() => resolve(null), 5000);
    });
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
    onAudioUploaded({ file_uri, file_name: file.name, duration });
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      {!hasAudio ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
          className={`rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 py-10 transition-all ${dragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
        >
          {uploading ? (
            <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{isNew ? "Drop the audio file or click to browse" : "Drop a version of this song or click to browse"}</p>
              <p className="text-xs text-muted-foreground/70">MP3, WAV, FLAC</p>
            </>
          )}
        </div>
      ) : versions.length > 0 ? (
        <div className="space-y-2">
          {versions.map((v) => <VersionRow key={v.id} version={v} />)}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          One version so far — drop another file of this song on the Vault page and SAM groups it here.
        </p>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => { handleFile(e.target.files[0]); e.target.value = ""; }}
      />
      {pipeline?.id && (
        <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
          <p className="text-xs text-muted-foreground">Every mix and master of this song, grouped automatically.</p>
          <Link
            to={`/song-versions/${pipeline.id}`}
            className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline shrink-0"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Full version history
          </Link>
        </div>
      )}
    </div>
  );
}