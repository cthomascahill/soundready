import { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Play, Pause, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resolvePlayableAudioUrl } from "@/lib/audioPlayback";
import { awardPoints } from "@/lib/awardPoints";
import VaultArtwork from "@/components/vault/VaultArtwork";
import VersionsTab from "@/components/vault/workspace/VersionsTab";
import DetailsTab from "@/components/vault/workspace/DetailsTab";
import ReleaseTab from "@/components/vault/workspace/ReleaseTab";
import ReleasePlanDialog from "@/components/vault/ReleasePlanDialog";
import { vaultStatusStyle } from "@/lib/vaultStatus";

// The song workspace — what "Edit Song" used to be. A song opens on its audio
// and versions, not a form: Details (credits, genre, BPM, moods) and Release
// (stage, links, plan) are tabs you visit when you need them.
export default function SongWorkspaceModal({ song, pipeline, projects = [], onClose, onSave }) {
  const isNew = !song?.id;
  const [form, setForm] = useState({
    title: song?.title || "",
    featured_artists: song?.featured_artists || "",
    producer: song?.producer || "",
    genre: song?.genre || "",
    bpm: song?.bpm || "",
    key: song?.key || "",
    moods: song?.moods || [],
    status: song?.status || "Demo",
    release_date: song?.release_date || "",
    spotify_url: song?.spotify_url || "",
    youtube_url: song?.youtube_url || "",
    lyrics: song?.lyrics || "",
    notes: song?.notes || "",
    tags: song?.tags || [],
    file_url: song?.file_url || "",
    file_name: song?.file_name || "",
    duration: song?.duration ?? null,
    artwork_url: song?.artwork_url || "",
    project_ids: song?.project_ids || [],
  });
  const [saving, setSaving] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [uploadingArt, setUploadingArt] = useState(false);
  const audioRef = useRef(null);
  const artworkRef = useRef(null);

  const handleArtwork = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploadingArt(true);
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
    setForm((f) => ({ ...f, artwork_url: file_url }));
    setUploadingArt(false);
  };

  const togglePlay = async () => {
    if (!audioRef.current || !form.file_url) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); return; }
    audioRef.current.src = await resolvePlayableAudioUrl(form.file_url);
    try { await audioRef.current.play(); setPlaying(true); } catch { setPlaying(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const data = { ...form, bpm: form.bpm ? Number(form.bpm) : null };
    if (isNew) {
      const created = await base44.entities.SongVault.create(data);
      awardPoints("song_uploaded", created.id, `Added "${created.title}" to the Vault`);
      onSave(created, "create");
    } else {
      const updated = await base44.entities.SongVault.update(song.id, data);
      onSave(updated, "update");
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header: artwork, title, one stage */}
        <div className="flex items-start gap-4 px-6 py-5 border-b border-border">
          <button onClick={() => artworkRef.current?.click()} title="Change artwork"
            className="relative shrink-0 rounded-xl group">
            <VaultArtwork url={form.artwork_url} title={form.title} className="h-16 w-16 rounded-xl object-cover" iconClass="h-6 w-6" />
            <span className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingArt ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <ImagePlus className="h-4 w-4 text-white" />}
            </span>
          </button>
          <div className="flex-1 min-w-0 space-y-1.5">
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Song title"
              className="w-full bg-transparent font-heading text-xl font-bold outline-none placeholder:text-muted-foreground/50"
            />
            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${vaultStatusStyle(form.status)}`}>
              {form.status}
            </span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* The song's audio, front and center */}
        {form.file_url && (
          <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-primary/5">
            <button onClick={togglePlay}
              className="h-9 w-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors shrink-0">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{form.file_name || "Current version"}</p>
              {form.duration != null && (
                <p className="text-xs text-muted-foreground">{Math.floor(form.duration / 60)}:{String(form.duration % 60).padStart(2, "0")}</p>
              )}
            </div>
            <audio ref={audioRef} onEnded={() => setPlaying(false)} />
          </div>
        )}

        {/* Tabs: audio and versions first, the rest on demand */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Tabs defaultValue={isNew ? "details" : "versions"}>
            <TabsList className="mb-5">
              {!isNew && <TabsTrigger value="versions">Versions</TabsTrigger>}
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="release">Release</TabsTrigger>
            </TabsList>
            {!isNew && (
              <TabsContent value="versions">
                <VersionsTab
                  song={song}
                  pipeline={pipeline}
                  hasAudio={!!form.file_url}
                  onAudioUploaded={({ file_uri, file_name, duration }) =>
                    setForm((f) => ({ ...f, file_url: file_uri, file_name, duration }))
                  }
                />
              </TabsContent>
            )}
            <TabsContent value="details">
              <DetailsTab form={form} setForm={setForm} projects={projects} />
            </TabsContent>
            <TabsContent value="release">
              <ReleaseTab form={form} setForm={setForm} song={song} onPlanRelease={() => setPlanOpen(true)} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isNew ? "Add to Vault" : "Save changes"}
          </Button>
        </div>

        <input ref={artworkRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { handleArtwork(e.target.files[0]); e.target.value = ""; }} />
      </div>
      {planOpen && <ReleasePlanDialog song={form} onClose={() => setPlanOpen(false)} />}
    </div>
  );
}