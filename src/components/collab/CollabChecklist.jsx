import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEFAULT_ITEMS = [
  { id: "mix", label: "Final mix approved", category: "Production" },
  { id: "master", label: "Mastering complete", category: "Production" },
  { id: "artwork", label: "Artwork submitted (3000x3000px)", category: "Assets" },
  { id: "metadata", label: "Metadata finalized (ISRC, title, genre)", category: "Distribution" },
  { id: "distributor", label: "Uploaded to distributor", category: "Distribution" },
  { id: "presave", label: "Pre-save link live", category: "Marketing" },
  { id: "socials", label: "Social captions written", category: "Marketing" },
  { id: "playlist", label: "Playlist pitches sent", category: "Promotion" },
  { id: "pr", label: "Press release drafted", category: "Promotion" },
  { id: "release_day", label: "Release day posts scheduled", category: "Launch" },
];

export default function CollabChecklist({ collab, canEdit, onUpdate }) {
  const progress = collab.checklist_progress || {};
  const [newItem, setNewItem] = useState("");
  const [customItems, setCustomItems] = useState(collab.custom_checklist_items || []);
  const [saving, setSaving] = useState(false);

  const allItems = [...DEFAULT_ITEMS, ...customItems];

  const toggleItem = async (id) => {
    if (!canEdit) return;
    const updated = { ...progress, [id]: !progress[id] };
    setSaving(true);
    await base44.entities.ReportCollaborator.update(collab.id, { checklist_progress: updated });
    onUpdate({ ...collab, checklist_progress: updated });
    setSaving(false);
  };

  const addCustomItem = async () => {
    if (!newItem.trim()) return;
    const item = { id: `custom_${Date.now()}`, label: newItem.trim(), category: "Custom" };
    const updated = [...customItems, item];
    setCustomItems(updated);
    setNewItem("");
    await base44.entities.ReportCollaborator.update(collab.id, { custom_checklist_items: updated });
  };

  const completedCount = allItems.filter((i) => progress[i.id]).length;
  const pct = Math.round((completedCount / allItems.length) * 100);

  const categories = [...new Set(allItems.map((i) => i.category))];

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{completedCount} of {allItems.length} tasks complete</span>
          <span className="font-bold text-primary">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Checklist by category */}
      {categories.map((cat) => (
        <div key={cat} className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{cat}</p>
          {allItems.filter((i) => i.category === cat).map((item) => (
            <button key={item.id} onClick={() => toggleItem(item.id)} disabled={!canEdit}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                progress[item.id]
                  ? "border-primary/30 bg-primary/5"
                  : "border-border hover:border-primary/20 bg-card"
              } ${!canEdit ? "cursor-default" : "cursor-pointer"}`}>
              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                progress[item.id] ? "border-primary bg-primary" : "border-muted-foreground/30"
              }`}>
                {progress[item.id] && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className={`text-sm ${progress[item.id] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      ))}

      {/* Add custom item */}
      {canEdit && (
        <div className="flex gap-2 pt-1">
          <Input
            placeholder="Add custom task..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
            className="text-sm"
          />
          <Button size="sm" variant="outline" onClick={addCustomItem} className="gap-1 shrink-0">
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      )}
    </div>
  );
}