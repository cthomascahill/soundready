import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import BeatUploadModal from "@/components/beatvault/BeatUploadModal";
import VaultCapPrompt, { VaultUsageBadge, FREE_VAULT_CAP } from "@/components/vault/VaultCapPrompt";
import { isProOrAbove } from "@/lib/tier";
import { Play, Pause, Pencil, Trash2, Plus, Loader2, Disc3 } from "lucide-react";

/**
 * Producer side of the Vault: the beat catalog.
 * Upload privately, tag with genre/BPM/key/moods, set lease & exclusive
 * pricing, and manage the catalog.
 */
export default function BeatVault() {
  const { user } = useAuth();
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [signingId, setSigningId] = useState(null);
  const [showCapPrompt, setShowCapPrompt] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.Beat.filter({ created_by_id: user.id }, "-created_date", 100)
      .then(setBeats)
      .catch(() => setBeats([]))
      .finally(() => setLoading(false));
  }, [user]);

  // Private uploads get a short-lived signed URL for in-app playback
  const playBeat = async (beat) => {
    if (playingId === beat.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    let url = beat.file_url;
    if (url && !url.startsWith("http")) {
      setSigningId(beat.id);
      try {
        const res = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: url, expires_in: 3600 });
        url = res.signed_url;
      } catch {
        url = null;
      }
      setSigningId(null);
    }
    if (!url) return;
    audioRef.current.src = url;
    audioRef.current.play();
    setPlayingId(beat.id);
  };

  const deleteBeat = async (beat) => {
    if (!window.confirm(`Delete "${beat.title}"? This can't be undone.`)) return;
    await base44.entities.Beat.delete(beat.id);
    setBeats((prev) => prev.filter((b) => b.id !== beat.id));
  };

  const onSaved = (beat, isNew) => {
    setBeats((prev) => (isNew ? [beat, ...prev] : prev.map((b) => (b.id === beat.id ? beat : b))));
  };

  const isFree = !isProOrAbove(user);
  const atCap = isFree && beats.length >= FREE_VAULT_CAP;
  const openUpload = () => {
    if (atCap) { setShowCapPrompt(true); return; }
    setEditing(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Producer</p>
            <h1 className="font-heading text-3xl font-bold">Beat Vault</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your entire beat catalog — organized, priced, and ready to pitch.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isFree && <VaultUsageBadge count={beats.length} label="beats" />}
            <Button className="gap-2 font-semibold" onClick={openUpload}>
              <Plus className="h-4 w-4" /> Upload a Beat
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : beats.length === 0 ? (
          <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center space-y-3">
            <Disc3 className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="font-heading font-bold text-lg">Your vault is empty</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Upload your first beat with its genre, BPM, key, and pricing. Every beat you add also powers
              Artist Match and Maya's pitching.
            </p>
            <Button
              size="sm"
              className="gap-2 mx-auto"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Upload Your First Beat
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {beats.map((beat, i) => (
              <motion.div
                key={beat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl bg-card border border-border p-4 space-y-3 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{beat.title}</p>
                    <p className="text-xs text-muted-foreground">{beat.stage || "Idea"}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditing(beat);
                        setModalOpen(true);
                      }}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBeat(beat)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {beat.genre && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{beat.genre}</span>
                  )}
                  {beat.bpm && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{beat.bpm} BPM</span>}
                  {beat.key && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">Key of {beat.key}</span>}
                  {(beat.mood_tags || []).slice(0, 2).map((m) => (
                    <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{m}</span>
                  ))}
                </div>

                {(beat.lease_price || beat.exclusive_price) && (
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    {beat.lease_price != null && <span>Lease <span className="text-foreground font-semibold">${beat.lease_price}</span></span>}
                    {beat.exclusive_price != null && <span>Exclusive <span className="text-foreground font-semibold">${beat.exclusive_price}</span></span>}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => playBeat(beat)}
                    disabled={signingId === beat.id}
                    className="h-8 w-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors disabled:opacity-50"
                  >
                    {signingId === beat.id ? (
                      <Loader2 className="h-3.5 w-3.5 text-black animate-spin" />
                    ) : playingId === beat.id ? (
                      <Pause className="h-3.5 w-3.5 text-black" />
                    ) : (
                      <Play className="h-3.5 w-3.5 text-black ml-0.5" />
                    )}
                  </button>
                  <span className="text-[10px] text-muted-foreground">{(beat.play_count || 0).toLocaleString()} plays</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BeatUploadModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={onSaved} beat={editing} />

      {showCapPrompt && (
        <VaultCapPrompt kind="beat" onClose={() => setShowCapPrompt(false)} />
      )}
    </div>
  );
}