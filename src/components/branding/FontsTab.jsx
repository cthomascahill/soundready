import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRIMARY_FONTS = [
  { id: "impact", name: "Impact", stack: "Impact, Haettenschweiler, sans-serif" },
  { id: "arial_black", name: "Arial Black", stack: "'Arial Black', Gadget, sans-serif" },
  { id: "georgia", name: "Georgia", stack: "Georgia, 'Times New Roman', serif" },
  { id: "trebuchet", name: "Trebuchet MS", stack: "'Trebuchet MS', Helvetica, sans-serif" },
  { id: "courier", name: "Courier New", stack: "'Courier New', Courier, monospace" },
  { id: "palatino", name: "Palatino", stack: "Palatino, 'Palatino Linotype', serif" },
];

const SECONDARY_FONTS = [
  { id: "helvetica", name: "Helvetica", stack: "Helvetica Neue, Helvetica, Arial, sans-serif" },
  { id: "garamond", name: "Garamond", stack: "Garamond, 'Times New Roman', serif" },
  { id: "verdana", name: "Verdana", stack: "Verdana, Geneva, sans-serif" },
  { id: "gill_sans", name: "Gill Sans", stack: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" },
  { id: "optima", name: "Optima", stack: "Optima, Segoe, 'Segoe UI', Candara, Calibri, Arial, sans-serif" },
  { id: "century", name: "Century Gothic", stack: "'Century Gothic', CenturyGothic, AppleGothic, sans-serif" },
];

function FontCard({ font, selected, onClick, previewText, large }) {
  return (
    <button onClick={onClick}
      className={`rounded-xl border p-4 text-left transition-all ${selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}>
      <p className={`truncate ${large ? "text-2xl" : "text-xl"} font-bold`} style={{ fontFamily: font.stack }}>
        {previewText}
      </p>
      <p className="text-[11px] text-muted-foreground mt-1.5">{font.name}</p>
    </button>
  );
}

export default function FontsTab({ artistName, onSave }) {
  const [primary, setPrimary] = useState(PRIMARY_FONTS[0]);
  const [secondary, setSecondary] = useState(SECONDARY_FONTS[0]);
  const [saved, setSaved] = useState(false);

  const save = () => {
    onSave("font_combo", {
      primary: { name: primary.name, stack: primary.stack },
      secondary: { name: secondary.name, stack: secondary.stack },
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
  };

  return (
    <div className="space-y-8">
      {/* Primary font */}
      <div className="space-y-3">
        <div>
          <p className="font-semibold text-sm">Primary Font</p>
          <p className="text-xs text-muted-foreground">For display, logo, and hero text</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PRIMARY_FONTS.map(f => (
            <FontCard key={f.id} font={f} selected={primary.id === f.id} onClick={() => { setPrimary(f); setSaved(false); }}
              previewText={(artistName || "ARTIST").toUpperCase()} />
          ))}
        </div>
      </div>

      {/* Secondary font */}
      <div className="space-y-3">
        <div>
          <p className="font-semibold text-sm">Secondary Font</p>
          <p className="text-xs text-muted-foreground">For bios, press kit body text, captions</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SECONDARY_FONTS.map(f => (
            <FontCard key={f.id} font={f} selected={secondary.id === f.id} onClick={() => { setSecondary(f); setSaved(false); }}
              previewText="The quick brown fox" />
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-2xl border border-border bg-zinc-950 p-8 space-y-3">
        <p className="text-xs text-muted-foreground">Live Preview</p>
        <p className="text-5xl font-black text-white" style={{ fontFamily: primary.stack }}>
          {(artistName || "ARTIST NAME").toUpperCase()}
        </p>
        <p className="text-base text-zinc-400" style={{ fontFamily: secondary.stack }}>
          Independent artist from Atlanta, GA · R&B · Hip-Hop · Soul
        </p>
        <div className="flex gap-4 mt-2 text-xs text-zinc-600">
          <span>Primary: <span className="text-primary">{primary.name}</span></span>
          <span>Secondary: <span className="text-primary">{secondary.name}</span></span>
        </div>
      </div>

      <Button onClick={save} disabled={saved} className="gap-2">
        <Save className="h-4 w-4" /> {saved ? "Saved to Brand Kit!" : "Save Fonts to Brand Kit"}
      </Button>
    </div>
  );
}