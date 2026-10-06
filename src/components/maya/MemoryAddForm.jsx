import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";

/**
 * Input row + tappable suggestion chips for adding a new Sam memory entry.
 */
export default function MemoryAddForm({ suggestions, onAdd, placeholder }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const v = value.trim();
    if (!v || saving) return;
    setSaving(true);
    try {
      await onAdd(v);
      setValue("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={placeholder}
          disabled={saving}
        />
        <Button size="sm" onClick={submit} disabled={saving || !value.trim()} className="gap-1.5 shrink-0">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Add
        </Button>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue(s)}
              disabled={saving}
              className="px-2.5 py-1 rounded-full text-[11px] text-muted-foreground bg-secondary/60 border border-border hover:border-primary/40 hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}