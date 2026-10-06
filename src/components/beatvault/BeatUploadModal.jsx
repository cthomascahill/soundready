import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { hasAIManager } from "@/lib/tier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GENRES, MOODS } from "@/lib/beatMeta";
import { Loader2, Upload } from "lucide-react";

const EMPTY = { title: "", genre: "", bpm: "", key: "", mood_tags: [], lease_price: "", exclusive_price: "", notes: "", for_sale: false };

/**
 * Create or edit a beat in the producer's Productions.
 * Audio uploads are stored privately; only the producer can play them.
 */
export default function BeatUploadModal({ open, onClose, onSaved, beat }) {
  const { user } = useAuth();
  const isEdit = !!beat;
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setFileName("");
    setForm(
      beat
        ? {
            title: beat.title || "",
            genre: beat.genre || "",
            bpm: beat.bpm || "",
            key: beat.key || "",
            mood_tags: beat.mood_tags || [],
            lease_price: beat.lease_price ?? "",
            exclusive_price: beat.exclusive_price ?? "",
            notes: beat.notes || "",
            for_sale: !!beat.for_sale,
          }
        : EMPTY
    );
  }, [open, beat]);

  if (!open) return null;

  const save = async () => {
    if (!form.title || (!isEdit && !file)) return;
    setSaving(true);
    try {
      let fileUrl = beat?.file_url;
      if (file) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        fileUrl = file_uri;
      }
      const payload = {
        title: form.title,
        genre: form.genre || undefined,
        bpm: form.bpm ? parseFloat(form.bpm) : undefined,
        key: form.key || undefined,
        mood_tags: form.mood_tags,
        lease_price: form.lease_price !== "" ? parseFloat(form.lease_price) : undefined,
        exclusive_price: form.exclusive_price !== "" ? parseFloat(form.exclusive_price) : undefined,
        notes: form.notes || undefined,
        for_sale: !!form.for_sale,
      };

      let saved;
      if (isEdit) {
        saved = await base44.entities.Beat.update(beat.id, payload);
      } else {
        saved = await base44.entities.Beat.create({
          ...payload,
          producer_name: user?.artist_name || user?.full_name || user?.email,
          producer_email: user?.email,
          file_url: fileUrl,
          status: "pending",
          stage: "Idea",
          play_count: 0,
          saves: [],
        });
        // Sam drafts a pitch to a matching artist for AI Manager producers
        if (hasAIManager(user)) {
          base44.functions.invoke("aiProducerPitch", { beat_id: saved.id }).catch(() => {});
        }
      }
      onSaved(saved, !isEdit);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 z-10">
        <p className="font-heading font-bold text-lg">{isEdit ? "Edit Beat" : "Upload a Beat"}</p>

        {!isEdit && (
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Beat File (MP3 or WAV) *</label>
            <input
              type="file"
              accept=".mp3,.wav"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setFileName(e.target.files[0]?.name || "");
              }}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-border file:text-xs file:font-medium file:bg-secondary hover:file:bg-secondary/60 cursor-pointer"
            />
            {fileName && <p className="text-xs text-primary">{fileName}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Beat Title *</label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Midnight Drip" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Genre</label>
            <select
              value={form.genre}
              onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
              className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select…</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">BPM</label>
            <Input type="number" value={form.bpm} onChange={(e) => setForm((f) => ({ ...f, bpm: e.target.value }))} placeholder="e.g. 140" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Key</label>
            <Input value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} placeholder="e.g. F minor" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Lease Price ($)</label>
            <Input type="number" value={form.lease_price} onChange={(e) => setForm((f) => ({ ...f, lease_price: e.target.value }))} placeholder="e.g. 30" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Exclusive Price ($)</label>
            <Input type="number" value={form.exclusive_price} onChange={(e) => setForm((f) => ({ ...f, exclusive_price: e.target.value }))} placeholder="e.g. 300" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={form.for_sale}
            onChange={(e) => setForm((f) => ({ ...f, for_sale: e.target.checked }))}
            className="h-4 w-4 rounded border-border"
          />
          List this beat for sale in my public Beat Store
        </label>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Mood Tags</label>
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    mood_tags: f.mood_tags.includes(m) ? f.mood_tags.filter((x) => x !== m) : [...f.mood_tags, m],
                  }))
                }
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  form.mood_tags.includes(m)
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Anything you want to remember about this beat…"
            className="w-full h-20 rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 gap-2" onClick={save} disabled={saving || !form.title || (!isEdit && !file)}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add to Vault"}
          </Button>
        </div>
      </div>
    </div>
  );
}