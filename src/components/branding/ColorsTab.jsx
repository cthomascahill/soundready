import { useState } from "react";
import { Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOODS = [
  { id: "dark_bold", label: "Dark & Bold", colors: ["#000000", "#ffffff", "#1a1a1a", "#333333", "#666666"] },
  { id: "warm_soul", label: "Warm Soul", colors: ["#f5e6c8", "#d4a853", "#8b5e3c", "#c4956a", "#2c1810"] },
  { id: "neon_electric", label: "Neon Electric", colors: ["#0a0a0a", "#00ff88", "#00ccff", "#ff0066", "#1a1a1a"] },
  { id: "soft_ethereal", label: "Soft & Ethereal", colors: ["#e8d5f0", "#c9a0dc", "#f5c6d0", "#b8a9c9", "#f0e6f6"] },
  { id: "earth_roots", label: "Earth & Roots", colors: ["#c4651a", "#6b7c3a", "#d4b483", "#8b4513", "#f5deb3"] },
  { id: "chrome_steel", label: "Chrome & Steel", colors: ["#c0c0c0", "#808080", "#404040", "#e8e8e8", "#1a1a1a"] },
];

export default function ColorsTab({ artistName, onSave }) {
  const [activeMood, setActiveMood] = useState(MOODS[0]);
  const [palette, setPalette] = useState(MOODS[0].colors);
  const [previewColor, setPreviewColor] = useState("#22c55e");
  const [customColor, setCustomColor] = useState("#22c55e");
  const [saved, setSaved] = useState(false);

  const selectMood = (mood) => {
    setActiveMood(mood);
    setPalette(mood.colors);
    setSaved(false);
  };

  const addCustom = () => {
    if (palette.length < 8) setPalette(prev => [...prev, customColor]);
    setSaved(false);
  };

  const save = () => {
    onSave("palette", { name: activeMood.label, colors: palette, createdAt: new Date().toISOString() });
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* Mood cards */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Choose a Mood</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MOODS.map(mood => (
            <button key={mood.id} onClick={() => selectMood(mood)}
              className={`rounded-xl border p-3 text-left transition-all ${activeMood.id === mood.id ? "border-primary" : "border-border hover:border-primary/40"}`}>
              <div className="flex gap-1 mb-2">
                {mood.colors.slice(0, 5).map((c, i) => (
                  <div key={i} className="h-5 flex-1 rounded" style={{ backgroundColor: c }} />
                ))}
              </div>
              <p className="text-xs font-medium">{mood.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Active palette swatches */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Active Palette — click to preview on text</p>
        <div className="flex flex-wrap gap-2">
          {palette.map((c, i) => (
            <button key={i} onClick={() => setPreviewColor(c)}
              className={`h-10 w-10 rounded-lg border-2 transition-all ${previewColor === c ? "border-primary scale-110" : "border-transparent hover:scale-105"}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Custom color */}
      <div className="flex items-center gap-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Add Custom Color</p>
          <div className="flex items-center gap-2">
            <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)}
              className="h-9 w-16 rounded-lg border border-input cursor-pointer" />
            <Button variant="outline" size="sm" onClick={addCustom} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
        </div>
      </div>

      {/* Live text preview */}
      <div className="rounded-2xl border border-border bg-zinc-950 p-8 text-center space-y-2">
        <p className="text-xs text-muted-foreground mb-3">Live Preview</p>
        <p className="font-heading font-black text-5xl tracking-widest transition-colors" style={{ color: previewColor }}>
          {(artistName || "ARTIST").toUpperCase()}
        </p>
        <p className="text-sm" style={{ color: previewColor, opacity: 0.6 }}>Music · Brand · Identity</p>
      </div>

      <Button onClick={save} disabled={saved} className="gap-2">
        <Save className="h-4 w-4" /> {saved ? "Saved to Brand Kit!" : "Save Palette to Brand Kit"}
      </Button>
    </div>
  );
}