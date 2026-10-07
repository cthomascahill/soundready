import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { matchPlaylists } from "@/lib/playlistMatch";
import {
  Music2, Loader2, Users, CheckCircle2, AlertTriangle, ChevronRight, Inbox,
} from "lucide-react";

const MATCH_BADGE = {
  "Genre match": "bg-primary/10 text-primary border-primary/20",
  "Close genre": "bg-cyan-500/5 text-cyan-400 border-cyan-500/20",
};

const STATUS_PILL = {
  pending: { label: "In your queue", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25" },
  ready_to_send: { label: "In your queue", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25" },
  viewed: { label: "In your queue", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25" },
  sent: { label: "Sent", cls: "bg-primary/10 text-primary border-primary/20" },
  denied: { label: "Denied", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  complete: { label: "Complete", cls: "bg-secondary text-muted-foreground border-border" },
};

/**
 * Sam's playlist pitching board — matched playlists from the curator database.
 * Drafting a pitch files it into the Awaiting Approval queue; nothing sends
 * without the artist's approval.
 */
export default function PlaylistPitchPanel({ user, activities = [], onQueued, onQueueClick }) {
  const [songs, setSongs] = useState(null);
  const [songId, setSongId] = useState("");
  const [busyName, setBusyName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    base44.entities.SongVault.list("-created_date", 50)
      .then((list) => {
        setSongs(list);
        if (list.length) setSongId(list[0].id);
      })
      .catch(() => setSongs([]));
  }, [user]);

  const song = (songs || []).find((s) => s.id === songId);
  const matches = song ? matchPlaylists(song, { limit: 12 }) : [];

  // What Sam has already drafted or sent for this song
  const pitchedFor = (name) =>
    activities.find(
      (a) => a.action_type === "playlist_pitch" && a.metadata?.playlist_name === name && a.song_id === song?.id
    );

  const draftPitch = async (playlist) => {
    setError("");
    setBusyName(playlist.name);
    const res = await base44.functions.invoke("mayaPlaylistPitch", {
      song_id: song.id,
      playlist: {
        name: playlist.name,
        curator: playlist.curator,
        email: playlist.email,
        note: playlist.note,
        followers: playlist.followers,
      },
    }).catch((e) => ({ data: { error: e.message } }));
    setBusyName("");
    if (res.data?.error) {
      setError(res.data.error);
      return;
    }
    if (onQueued) onQueued(res.data);
  };

  if (songs === null) {
    return <div className="h-24 rounded-xl bg-card border border-border animate-pulse" />;
  }

  if (!songs.length) {
    return (
      <div className="rounded-2xl bg-card border border-dashed border-border p-10 text-center space-y-3">
        <Music2 className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="font-semibold">Sam needs a song to pitch</p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Drop a song into your Vault and Sam will match it to real playlist curators in your genre.
        </p>
        <Link to="/history" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
          Open your Vault <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Song picker */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Pick a song for Sam to pitch</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {songs.map((s) => (
            <button key={s.id} onClick={() => setSongId(s.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                s.id === songId
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "text-muted-foreground border-border hover:text-foreground"
              }`}>
              {s.title}
            </button>
          ))}
        </div>
        {song && !song.genre && (
          <p className="text-[11px] text-muted-foreground">
            This song has no genre set — add one in the Vault for closer playlist matches.
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      )}

      {/* Matched playlists */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Sam matched {matches.length} playlists for this song — closest genre matches first, then the biggest open lists.
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="rounded-2xl bg-card border border-dashed border-border p-10 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">No playlists matched yet.</p>
          </div>
        ) : (
          matches.map((p) => {
            const pitched = pitchedFor(p.name);
            const pill = pitched ? STATUS_PILL[pitched.status] : null;
            const inQueue = pill && pill.label === "In your queue";
            return (
              <div key={p.name} className="rounded-xl border border-border bg-card p-4 flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      MATCH_BADGE[p.matchLabel] || "bg-secondary text-muted-foreground border-border"
                    }`}>{p.matchLabel}</span>
                    {pill && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pill.cls}`}>{pill.label}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-3 w-3" /> {p.curator} · {p.followers} followers
                  </p>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">{p.note}</p>
                </div>
                <div className="shrink-0 pt-1">
                  {busyName === p.name ? (
                    <Button size="sm" disabled className="gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Drafting…
                    </Button>
                  ) : pitched ? (
                    inQueue ? (
                      <Button size="sm" variant="outline" onClick={onQueueClick}
                        className="gap-1.5 text-primary border-primary/30 hover:bg-primary/10">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Review draft
                      </Button>
                    ) : null
                  ) : (
                    <Button size="sm" onClick={() => draftPitch(p)} className="gap-1.5 font-semibold">
                      <Music2 className="h-3.5 w-3.5" /> Draft pitch
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <p className="text-[11px] text-muted-foreground/70">
          Every drafted pitch lands in your Awaiting Approval queue — nothing sends until you approve it.
        </p>
      </div>
    </div>
  );
}