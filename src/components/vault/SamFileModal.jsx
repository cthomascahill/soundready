import { useEffect, useState } from "react";
import { Bot, Check, ImagePlus, Loader2, Music2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mirrorVaultSongsToTracker } from "@/lib/vaultTrackerSync";
import { cleanSongTitle } from "@/lib/audioFiles";
import SamLogo from "@/components/SamLogo";

const STAGES = ["Idea", "Demo", "Recorded", "Mixed", "Mastered", "Released"];

// The two-question intake: name it, pick a stage — Sam files it in the Vault + Tracker
export default function SamFileModal({ file, onFiled, onAddArtwork, onClose }) {
  const [title, setTitle] = useState(() => cleanSongTitle(file.name));
  const [stage, setStage] = useState(null);
  const [duration, setDuration] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filed, setFiled] = useState(null);
  const [error, setError] = useState("");

  // Read the track length quietly while the artist answers
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration)) setDuration(Math.round(audio.duration));
    };
    audio.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const fileIt = async () => {
    setBusy(true);
    setError("");
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const song = await base44.entities.SongVault.create({
        title: title.trim(),
        status: stage,
        file_url: file_uri,
        file_name: file.name,
        ...(duration ? { duration } : {}),
      });
      const [tracker] = await mirrorVaultSongsToTracker([song]);
      const result = { song, tracker: tracker || null };
      setFiled(result);
      onFiled?.(result);
    } catch (e) {
      setError("Upload failed — try again.");
    }
    setBusy(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={filed ? onClose : undefined}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {filed ? (
          <>
            <div className="flex items-center gap-3">
              <span className="h-11 w-11 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                <Check className="h-5 w-5 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="font-heading font-bold text-lg leading-tight">Filed.</p>
                <p className="text-sm text-muted-foreground truncate">{filed.song.title}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm">
                <Check className="h-3.5 w-3.5 text-primary" />
                <span className="flex-1">Vault</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">saved</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm">
                <Check className="h-3.5 w-3.5 text-primary" />
                <span className="flex-1">Tracker</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {filed.tracker ? "saved" : "already there"}
                </span>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              {onAddArtwork && (
                <Button variant="outline" className="flex-1 gap-2" onClick={() => onAddArtwork(filed.song)}>
                  <ImagePlus className="h-4 w-4" /> Add artwork
                </Button>
              )}
              <Button className="flex-1" onClick={onClose}>Done</Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <SamLogo className="h-8 w-8 text-primary" />
                <p className="font-heading font-bold">New song</p>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg bg-secondary/50 border border-border px-3 py-2">
              <Music2 className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs truncate flex-1">{file.name}</p>
              <span className="text-[10px] text-muted-foreground shrink-0">{(file.size / 1048576).toFixed(1)} MB</span>
            </div>

            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Song name" autoFocus />

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stage</p>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStage(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      stage === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button className="w-full gap-2" disabled={!title.trim() || !stage || busy} onClick={fileIt}>
              {busy ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sam's filing it…</>
              ) : (
                <><Bot className="h-4 w-4" /> File it</>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}