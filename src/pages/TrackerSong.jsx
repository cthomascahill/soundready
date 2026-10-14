import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import StageBadge from "@/components/songtracker/StageBadge";
import SongRowMenu from "@/components/songtracker/SongRowMenu";
import SongDetails from "@/components/songtracker/SongDetails";
import { getCurrentStage, getNextStage } from "@/lib/songStatus";
import { applyTrackerSongUpdate } from "@/lib/trackerSongUpdate";

// A song's own page: open a row in the Tracker and the rest of the list falls
// away — just this song, its stages, notes and (on demand) its details.
export default function TrackerSong() {
  const { songId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!user?.id || !songId) return;
    base44.entities.PipelineSong.get(songId)
      .then((s) => {
        setSong(s);
        setName(s.song_name || "");
        setLoading(false);
      })
      .catch(() => {
        setSong(null);
        setLoading(false);
      });
    base44.entities.ReleaseProject.filter({ created_by_id: user.id }, "-created_date", 100)
      .then(setProjects)
      .catch(() => {});
  }, [user?.id, songId]);

  const update = async (changes) => {
    if (!song?.id) return;
    setSong((prev) => ({ ...prev, ...changes }));
    await applyTrackerSongUpdate(user.id, song, changes);
  };

  const saveName = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== (song.song_name || "")) update({ song_name: trimmed });
  };

  const handleDelete = async () => {
    if (!song || !window.confirm(`Delete "${song.song_name || "Untitled"}"?`)) return;
    await base44.entities.PipelineSong.delete(song.id);
    navigate("/song-tracker");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground text-sm">This song isn't here anymore.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/song-tracker")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Tracker
        </Button>
      </div>
    );
  }

  const moveTargets = [
    { id: null, label: "Singles" },
    ...projects.map((p) => ({ id: p.id, label: p.name })),
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/song-tracker")} className="gap-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Tracker
        </Button>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            placeholder="Song name..."
            className="flex-1 min-w-0 bg-transparent font-heading text-3xl font-bold outline-none placeholder:text-muted-foreground/40"
          />
          <StageBadge stage={getCurrentStage(song)} />
          <SongRowMenu
            song={song}
            nextStage={getNextStage(song)}
            moveTargets={moveTargets}
            onAdvance={(key) => update({ [key]: true })}
            onMove={(projectId) => update({ project_id: projectId })}
            onDelete={handleDelete}
          />
        </div>

        <SongDetails song={song} onUpdate={(id, changes) => update(changes)} />
      </div>
    </div>
  );
}