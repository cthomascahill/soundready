import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Users, Music2, CalendarDays, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import StageBadge from "@/components/songtracker/StageBadge";
import { getCurrentStage } from "@/lib/songStatus";

// One read-only row in the shared tracker
function SharedSongRow({ song }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 border-b border-border last:border-b-0">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <Music2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="font-medium truncate">{song.song_name || "Untitled"}</span>
      </div>
      <StageBadge stage={getCurrentStage(song)} />
      {song.release_date && (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground w-28 shrink-0">
          <CalendarDays className="h-3.5 w-3.5" /> {song.release_date}
        </span>
      )}
      {song.audio_url && (
        <audio controls preload="none" src={song.audio_url} className="h-8 w-full sm:w-56 shrink-0" />
      )}
      {song.notes && (
        <p className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground truncate max-w-40">
          <StickyNote className="h-3.5 w-3.5 shrink-0" /> {song.notes}
        </p>
      )}
    </div>
  );
}

// Read-only view of a tracker an artist shared with the logged-in teammate
export default function SharedTracker() {
  const [searchParams, setSearchParams] = useSearchParams();
  const ownerFromUrl = searchParams.get("owner");
  const [owners, setOwners] = useState(null); // null = loading
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    base44.functions.invoke("trackerShare", { action: "list-mine" })
      .then((res) => setOwners(res.data?.owners || []))
      .catch(() => setOwners([]));
  }, []);

  useEffect(() => {
    if (!ownerFromUrl) { setData(null); return; }
    setData(null);
    setError("");
    base44.functions.invoke("trackerShare", { action: "get", owner_id: ownerFromUrl })
      .then((res) => {
        if (res.data?.error) setError(res.data.error);
        else setData(res.data);
      })
      .catch(() => setError("Couldn't load this tracker."));
  }, [ownerFromUrl]);

  const selectedOwner = owners?.find((o) => o.owner_id === ownerFromUrl);

  if (owners === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Pick whose tracker to open
  if (!ownerFromUrl) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Shared with you</p>
            <h1 className="font-heading text-4xl font-bold">Shared Trackers</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Trackers artists have invited you to. You can listen to their mix files — read-only.
            </p>
          </div>
          {owners.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border p-10 text-center space-y-3">
              <Users className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Nothing shared with you yet. When an artist invites you as a teammate, their Tracker shows up here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {owners.map((o) => (
                <button
                  key={o.owner_id}
                  onClick={() => setSearchParams({ owner: o.owner_id })}
                  className="w-full flex items-center gap-3 rounded-xl bg-card border border-border p-4 text-left hover:border-primary/40 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {(o.owner_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold truncate">{o.owner_name}</p>
                    <p className="text-xs text-muted-foreground">Shared their Tracker with you</p>
                  </div>
                  <Button size="sm" variant="outline">Open</Button>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // One artist's tracker, read-only
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button
          variant="ghost" size="sm"
          onClick={() => setSearchParams({})}
          className="gap-2 -ml-2 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Shared with you · read-only</p>
          <h1 className="font-heading text-4xl font-bold">{selectedOwner?.owner_name || "Shared"}'s Tracker</h1>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!data && !error && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {data && data.songs.length === 0 && (
          <div className="rounded-2xl bg-card border border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">No songs in this tracker yet.</p>
          </div>
        )}

        {data && data.songs.length > 0 && (
          <div className="space-y-6">
            {data.projects.map((project) => {
              const songs = data.songs.filter((s) => s.project_id === project.id);
              if (!songs.length) return null;
              return (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-xl font-bold">{project.name}</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground bg-secondary px-2 py-1 rounded">
                      {project.project_type}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-card border border-border overflow-hidden">
                    {songs.map((s) => <SharedSongRow key={s.id} song={s} />)}
                  </div>
                </div>
              );
            })}
            {(() => {
              const singles = data.songs.filter((s) => !s.project_id);
              if (!singles.length) return null;
              return (
                <div className="space-y-2">
                  <h2 className="font-heading text-xl font-bold">Singles</h2>
                  <div className="rounded-2xl bg-card border border-border overflow-hidden">
                    {singles.map((s) => <SharedSongRow key={s.id} song={s} />)}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}