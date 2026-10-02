import { useState, useEffect, useCallback, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectsGrid from "@/components/songtracker/ProjectsGrid";
import TrackerList from "@/components/songtracker/TrackerList";

export default function SongTracker() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  // null = project folders view; "all" / "singles" / a project id = that project's song list
  const [openProjectId, setOpenProjectId] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.PipelineSong.filter({ created_by_id: user.id }, "sort_order", 500),
      base44.entities.ReleaseProject.filter({ created_by_id: user.id }, "-created_date", 100),
    ])
      .then(([songData, projectData]) => {
        setSongs(songData);
        setProjects(projectData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const addSong = async () => {
    const projectId =
      openProjectId && openProjectId !== "all" && openProjectId !== "singles" ? openProjectId : null;
    const newSong = await base44.entities.PipelineSong.create({
      song_name: "",
      project_id: projectId,
      stage_write: false,
      stage_record: false,
      stage_mix: false,
      stage_master: false,
      stage_review: false,
      stage_artwork: false,
      stage_submit: false,
      stage_released: false,
      notes: "",
      sort_order: songs.length,
    });
    setSongs((prev) => [...prev, newSong]);
    return newSong;
  };

  const updateSong = useCallback(async (id, changes) => {
    const song = songs.find((s) => s.id === id);
    const wasReleased = !!song?.stage_released;
    setSongs((prev) => prev.map((s) => s.id === id ? { ...s, ...changes } : s));
    await base44.entities.PipelineSong.update(id, changes);

    // A song marked Released graduates to the Song Vault (the finished catalog)
    if (changes.stage_released === true && !wasReleased && song?.song_name) {
      const existing = await base44.entities.SongVault.filter(
        { created_by_id: user.id, title: song.song_name }, "-created_date", 1
      );
      if (!existing.length) {
        await base44.entities.SongVault.create({
          title: song.song_name,
          status: "Released",
          release_date: changes.release_date || song.release_date || new Date().toISOString().slice(0, 10),
          notes: song.notes || "",
        });
      }
    }
  }, [songs, user]);

  const deleteSong = async (id) => {
    setSongs((prev) => prev.filter((s) => s.id !== id));
    await base44.entities.PipelineSong.delete(id);
  };

  const deleteProject = async (id) => {
    // Its songs drop back into the Singles folder
    setSongs((prev) => prev.map((s) => s.project_id === id ? { ...s, project_id: null } : s));
    await base44.entities.PipelineSong.updateMany({ project_id: id }, { $set: { project_id: null } });
    await base44.entities.ReleaseProject.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const moveTargets = useMemo(
    () => [
      { id: null, label: "Singles" },
      ...projects.map((p) => ({ id: p.id, label: p.name })),
    ],
    [projects]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Project folders view
  if (!openProjectId) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Pipeline</p>
            <h1 className="font-heading text-4xl font-bold">Song Tracker</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your active pipeline — every song from idea to launch. Mark one Released and it's saved to your Song Vault automatically.
            </p>
          </div>
          <ProjectsGrid
            songs={songs}
            projects={projects}
            onOpen={setOpenProjectId}
            onDeleteProject={deleteProject}
            onCreateProject={(project) => {
              setProjects((prev) => [project, ...prev]);
              setOpenProjectId(project.id);
            }}
          />
        </div>
      </div>
    );
  }

  // One project's song list
  const openProject = projects.find((p) => p.id === openProjectId);
  const title =
    openProjectId === "all" ? "All Songs" : openProjectId === "singles" ? "Singles" : openProject?.name;
  const scopedSongs =
    openProjectId === "all"
      ? songs
      : openProjectId === "singles"
        ? songs.filter((s) => !s.project_id)
        : songs.filter((s) => s.project_id === openProjectId);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpenProjectId(null)}
            className="gap-2 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All Projects
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-3xl font-bold">{title}</h1>
            {openProject && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground bg-secondary px-2 py-1 rounded">
                {openProject.project_type}
              </span>
            )}
          </div>
        </div>

        <TrackerList
          songs={scopedSongs}
          moveTargets={moveTargets}
          onAdd={addSong}
          onUpdate={updateSong}
          onDelete={deleteSong}
        />
      </div>
    </div>
  );
}