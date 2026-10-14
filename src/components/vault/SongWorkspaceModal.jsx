import { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Play, Pause, ImagePlus, Loader2, ChevronDown, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolvePlayableAudioUrl } from "@/lib/audioPlayback";
import { awardPoints } from "@/lib/awardPoints";
import VaultArtwork from "@/components/vault/VaultArtwork";
import VersionsTab from "@/components/vault/workspace/VersionsTab";
import DetailsTab from "@/components/vault/workspace/DetailsTab";
import ReleaseTab from "@/components/vault/workspace/ReleaseTab";
import ReleasePlanDialog from "@/components/vault/ReleasePlanDialog";
import { vaultStatusDot } from "@/lib/vaultStatus";

// The song view: what you came for is what you see, the player, the latest
// version, notes. Everything else waits behind one "More details" toggle.
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
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [moreOpen, setMoreOpen] = useState(isNew);
  const audioRef = useRef(null);
  const artworkRef = useRef(null);
  const audioInputRef = useRef(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleArtwork = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploadingArt(true);
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
    setForm((f) => ({ ...f, artwork_url: file_url }));
    setUploadingArt(false);
  };

  const handleAudioFile = async (file) => {
    if (!file || !file.type.startsWith("audio/")) return;
    setUploadingAudio(true);
    const localUrl = URL.createObjectURL(file);
    const duration = await new Promise((resolve) => {
      const a = new Audio();
      a.src = localUrl;
      a.onloadedmetadata = () => resolve(Math.round(a.duration));
      a.onerror = () => resolve(null);
      setTimeout(() => resolve(null), 5000);
    });
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
    setForm((f) => ({ ...f, file_url: file_uri, file_name: file.name, duration }));
    setUploadingAudio(false);
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
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header: artwork, title, quiet stage */}
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
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`h-1.5 w-1.5 rounded-full ${vaultStatusDot(form.status)}`} />
              {form.status}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* The song's audio, front and center */}
          {form.file_url ? (
            <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
              <button onClick={togglePlay}
                className="h-10 w-10 rounded-full bg-foreground/10 border border-foreground/15 flex items-center justify-center text-foreground hover:bg-foreground/20 transition-colors shrink-0">
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Latest version</p>
                <p className="text-sm truncate">{form.file_name || "Current version"}</p>
                {form.duration != null && (
                  <p className="text-xs text-muted-foreground">{Math.floor(form.duration / 60)}:{String(form.duration % 60).padStart(2, "0")}</p>
                )}
              </div>
              <audio ref={audioRef} onEnded={() => setPlaying(false)} />
            </div>
          ) : (
            <div
              onClick={() => audioInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-border hover:border-foreground/30 cursor-pointer flex items-center justify-center gap-2 py-5 text-sm text-muted-foreground transition-colors"
            >
              {uploadingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploadingAudio ? "Uploading…" : "Add this song's audio"}
            </div>
          )}

          {/* Notes */}
          <label className="block space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</span>
            <textarea
              value={form.notes || ""}
              onChange={set("notes")}
              placeholder="Production notes, ideas, references..."
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </label>

          {/* Everything else, on demand */}
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            {moreOpen ? "Hide details" : "More details"}
          </button>

          {moreOpen && (
            <div className="space-y-8 pt-1">
              {!isNew && (
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Versions</h3>
                  <VersionsTab
                    song={song}
                    pipeline={pipeline}
                    hasAudio={!!form.file_url}
                    onAudioUploaded={({ file_uri, file_name, duration }) =>
                      setForm((f) => ({ ...f, file_url: file_uri, file_name, duration }))
                    }
                  />
                </section>
              )}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
                <DetailsTab form={form} setForm={setForm} projects={projects} />
              </section>
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Release</h3>
                <ReleaseTab form={form} setForm={setForm} song={song} onPlanRelease={() => setPlanOpen(true)} />
              </section>
            </div>
          )}
        </div>

        {/* One main action */}
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isNew ? "Add to Vault" : "Save changes"}
          </Button>
        </div>

        <input ref={artworkRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { handleArtwork(e.target.files[0]); e.target.value = ""; }} />
        <input ref={audioInputRef} type="file" accept="audio/*" className="hidden"
          onChange={(e) => { handleAudioFile(e.target.files[0]); e.target.value = ""; }} />
      </div>
      {planOpen && <ReleasePlanDialog song={form} onClose={() => setPlanOpen(false)} />}
    </div>
  );
}