import { useState } from "react";
import { X, ListPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FREE_VAULT_CAP } from "@/components/vault/VaultCapPrompt";

// Paste a list of song titles — every line becomes a Released song in the vault.
export default function BulkAddSongs({ max, onClose, onCreated }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const titles = text.split("\n").map((t) => t.trim()).filter(Boolean);
  const allowed = max != null ? titles.slice(0, max) : titles;
  const skipped = titles.length - allowed.length;

  const handleAdd = async () => {
    if (!allowed.length) return;
    setSaving(true);
    const created = await base44.entities.SongVault.bulkCreate(
      allowed.map((title) => ({ title, status: "Released" }))
    );
    onCreated(created);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ListPlus className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-heading font-bold text-lg">Bulk Add Songs</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          Paste your song titles — one per line. Each becomes a Released song in your vault, ready to organize.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder={"Midnight Drive\nNeon Skyline\nGolden Hour\n..."}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-foreground font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />

        {titles.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {allowed.length} song{allowed.length === 1 ? "" : "s"} will be added.
            {skipped > 0 && ` ${skipped} skipped — the free plan holds ${FREE_VAULT_CAP} songs. Upgrade for unlimited.`}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="border-zinc-700">Cancel</Button>
          <Button onClick={handleAdd} disabled={saving || !allowed.length} className="gap-2">
            {saving ? <div className="h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" /> : null}
            Add {allowed.length || ""} Song{allowed.length === 1 ? "" : "s"}
          </Button>
        </div>
      </div>
    </div>
  );
}