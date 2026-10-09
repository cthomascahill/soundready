import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Play, Pause, Download, Star, Trash2, Loader2, Music2, History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolvePlayableAudioUrl } from "@/lib/audioPlayback";

const fmtDuration = (s) => {
  if (s == null) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  : "—";

const gapLabel = (from, to) => {
  if (!from || !to) return "—";
  const days = Math.round((new Date(to) - new Date(from)) / 86400000);
  if (days <= 0) return "same day";
  return `+${days} day${days === 1 ? "" : "s"}`;
};

// Full-page version history for one song: every mix and master as its own
// column, metadata aligned row by row, so progress between versions reads
// left to right. Playback restarts each version from the top for a fair A/B.
export default function SongVersions() {
  const { songId } = useParams();
  const [song, setSong] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [urlMap, setUrlMap] = useState({}); // id -> { url, duration }
  const [signing, setSigning] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!songId) return;
    Promise.all([
      base44.entities.PipelineSong.get(songId),
      base44.entities.SongVersion.filter({ pipeline_song_id: songId }, "-created_date", 50),
    ])
      .then(([s, v]) => { setSong(s); setVersions(v); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [songId]);

  // A mix saved elsewhere (the Tracker's A/B player) appears here live — no refresh needed
  useEffect(() => {
    if (!songId) return undefined;
    const unsub = base44.entities.SongVersion.subscribe(() => {
      base44.entities.SongVersion.filter({ pipeline_song_id: songId }, "-created_date", 50)
        .then(setVersions)
        .catch(() => {});
    });
    return unsub;
  }, [songId]);

  // Oldest → newest so progress reads left to right
  const ordered = [...versions].sort(
    (a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0)
  );

  // Sign private files + probe durations
  useEffect(() => {
    if (ordered.length === 0) return;
    let alive = true;
    setSigning(true);
    (async () => {
      const entries = await Promise.all(ordered.map(async (v) => {
        try {
          const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
            file_uri: v.file_uri, expires_in: 3600,
          });
          return [v.id, { url: await resolvePlayableAudioUrl(signed_url), duration: null }];
        } catch {
          return [v.id, { url: null, duration: null }];
        }
      }));
      if (!alive) return;
      setUrlMap(Object.fromEntries(entries));
      setSigning(false);
      entries.forEach(([id, entry]) => {
        if (!entry.url) return;
        const probe = new Audio();
        probe.preload = "metadata";
        probe.src = entry.url;
        probe.onloadedmetadata = () => {
          if (!alive || !isFinite(probe.duration)) return;
          setUrlMap(prev =>
            prev[id]?.duration == null
              ? { ...prev, [id]: { ...prev[id], duration: probe.duration } }
              : prev
          );
        };
      });
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId, versions.length]);

  // Cleanup playback on unmount
  useEffect(() => () => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    setPlayingId(null);
    setProgress(0);
  }, []);

  const togglePlay = (v) => {
    const entry = urlMap[v.id];
    if (!entry?.url) return;
    if (playingId === v.id) {
      stopAudio();
      return;
    }
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => { setPlayingId(null); setProgress(0); };
      audioRef.current.ontimeupdate = () => {
        const dur = audioRef.current?.duration;
        setProgress(dur ? audioRef.current.currentTime / dur : 0);
      };
    }
    audioRef.current.src = entry.url;
    audioRef.current.currentTime = 0; // restart from the top for a fair A/B
    audioRef.current.play();
    setPlayingId(v.id);
    setProgress(0);
  };

  const download = (v) => {
    const entry = urlMap[v.id];
    if (!entry?.url) return;
    const a = document.createElement("a");
    a.href = entry.url;
    a.download = `${song?.song_name || "song"} - ${v.label}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const makeLatest = async (v) => {
    await base44.entities.SongVersion.updateMany(
      { pipeline_song_id: songId, is_current: true },
      { $set: { is_current: false } }
    ).catch(() => {});
    await base44.entities.SongVersion.update(v.id, { is_current: true });
    setVersions(prev => prev.map(x => ({ ...x, is_current: x.id === v.id })));
    // Keep the song row's "latest mix" cell in sync
    await base44.entities.PipelineSong.update(songId, {
      audio_file_uri: v.file_uri, audio_version_label: v.label,
    }).catch(() => {});
  };

  const remove = async (id) => {
    await base44.entities.SongVersion.delete(id);
    if (playingId === id) stopAudio();
    setVersions(prev => prev.filter(v => v.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !song) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Music2 className="h-12 w-12 text-zinc-700" />
        <p className="text-zinc-500">Song not found.</p>
        <Link to="/song-tracker"><Button variant="outline" className="border-zinc-700">Back to Tracker</Button></Link>
      </div>
    );
  }

  const firstDate = ordered[0]?.created_date;
  const lastDate = ordered[ordered.length - 1]?.created_date;
  const spanDays = firstDate && lastDate
    ? Math.round((new Date(lastDate) - new Date(firstDate)) / 86400000)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <Link to="/song-tracker" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Tracker
        </Link>
        <div className="mb-6">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Version History</p>
          <h1 className="font-heading text-3xl font-bold">{song.song_name}</h1>
          <p className="text-zinc-500 text-sm mt-0.5 flex items-center gap-2 flex-wrap">
            <span>{ordered.length} version{ordered.length === 1 ? "" : "s"}</span>
            {spanDays != null && ordered.length > 1 && (
              <>
                <span className="text-zinc-700">·</span>
                <span>
                  {fmtDate(firstDate)} → {fmtDate(lastDate)} ({spanDays} day{spanDays === 1 ? "" : "s"} of iteration)
                </span>
              </>
            )}
            {song.audio_version_label && (
              <>
                <span className="text-zinc-700">·</span>
                <span>Latest: <span className="text-primary font-medium">{song.audio_version_label}</span></span>
              </>
            )}
          </p>
        </div>

        {ordered.length === 0 ? (
          <div className="text-center py-24 space-y-3">
            <History className="h-12 w-12 text-zinc-700 mx-auto" />
            <p className="text-zinc-500">
              No versions yet. Upload mixes from the song's panel in the Tracker and they'll appear here side by side.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium align-bottom w-32">
                    Metadata
                  </th>
                  {ordered.map((v, i) => (
                    <th key={v.id} className={`px-4 py-3 min-w-[180px] align-bottom border-l border-border/50 ${
                      v.is_current ? "bg-primary/5" : ""
                    }`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-semibold">{v.label}</span>
                        {v.is_current && (
                          <span className="text-[9px] font-bold uppercase text-primary bg-primary/10 border border-primary/25 px-1.5 py-0.5 rounded-full">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-normal mt-0.5">Version {ordered.length - i}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Playback row */}
                <tr className="border-b border-border/50">
                  <td className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Listen</td>
                  {ordered.map(v => {
                    const isPlaying = playingId === v.id;
                    return (
                      <td key={v.id} className="px-4 py-3 border-l border-border/50">
                        <div className="flex items-center gap-2">
                          <button onClick={() => togglePlay(v)}
                            title={isPlaying ? "Pause" : "Play from the top"}
                            className="h-9 w-9 rounded-full bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shrink-0 hover:bg-primary/25 transition-colors">
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                          </button>
                          <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full bg-primary transition-[width] duration-150"
                              style={{ width: isPlaying ? `${progress * 100}%` : "0%" }} />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
                {/* Uploaded row */}
                <tr className="border-b border-border/50">
                  <td className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Uploaded</td>
                  {ordered.map(v => (
                    <td key={v.id} className="px-4 py-3 border-l border-border/50">{fmtDate(v.created_date)}</td>
                  ))}
                </tr>
                {/* Progress between versions */}
                <tr className="border-b border-border/50">
                  <td className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Since previous</td>
                  {ordered.map((v, i) => (
                    <td key={v.id} className="px-4 py-3 border-l border-border/50">
                      {i === 0
                        ? <span className="text-zinc-600">First upload</span>
                        : <span className="text-primary">{gapLabel(ordered[i - 1].created_date, v.created_date)}</span>}
                    </td>
                  ))}
                </tr>
                {/* Duration row */}
                <tr className="border-b border-border/50">
                  <td className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Duration</td>
                  {ordered.map(v => (
                    <td key={v.id} className="px-4 py-3 border-l border-border/50 tabular-nums">
                      {signing && !urlMap[v.id] ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      ) : fmtDuration(urlMap[v.id]?.duration)}
                    </td>
                  ))}
                </tr>
                {/* Status row */}
                <tr className="border-b border-border/50">
                  <td className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Status</td>
                  {ordered.map(v => (
                    <td key={v.id} className="px-4 py-3 border-l border-border/50">
                      <span className={v.is_current ? "text-primary font-medium" : "text-zinc-500"}>
                        {v.is_current ? "Current" : "Archived"}
                      </span>
                    </td>
                  ))}
                </tr>
                {/* Actions row */}
                <tr>
                  <td className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Actions</td>
                  {ordered.map(v => (
                    <td key={v.id} className="px-4 py-3 border-l border-border/50">
                      <div className="flex items-center gap-1">
                        <button onClick={() => download(v)} title="Download this version"
                          className="h-7 w-7 flex items-center justify-center text-muted-foreground/50 hover:text-primary">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        {!v.is_current && (
                          <button onClick={() => makeLatest(v)} title="Make this the latest version"
                            className="h-7 w-7 flex items-center justify-center text-muted-foreground/50 hover:text-primary">
                            <Star className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button onClick={() => remove(v.id)} title="Delete this version"
                          className="h-7 w-7 flex items-center justify-center text-muted-foreground/50 hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {ordered.length > 1 && (
          <p className="text-xs text-zinc-600 mt-3">
            Playback restarts each version from the top so every listen is a fair A/B comparison.
          </p>
        )}
      </div>
    </div>
  );
}