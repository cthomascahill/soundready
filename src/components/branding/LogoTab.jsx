import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Download, RefreshCw, Save, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STYLES = [
  { id: "wordmark", label: "Wordmark", desc: "Full name as logo" },
  { id: "monogram", label: "Monogram", desc: "Initials only" },
  { id: "stacked", label: "Stacked", desc: "Name over tagline" },
];

const COLOR_VARIANTS = [
  { id: "dark", bg: "#0a0a0a", text: "#ffffff", label: "Dark" },
  { id: "light", bg: "#f5f5f5", text: "#0a0a0a", label: "Light" },
  { id: "accent", bg: "#0a0a0a", text: "#22c55e", label: "Accent" },
];

export default function LogoTab({ artistName: defaultArtist, onSave }) {
  const [artistName, setArtistName] = useState(defaultArtist || "");
  const [tagline, setTagline] = useState("");
  const [vibe, setVibe] = useState("");
  const [style, setStyle] = useState("wordmark");
  const [svgCode, setSvgCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const generate = async () => {
    if (!artistName.trim()) return;
    setLoading(true);
    setSaved(false);

    const styleDesc = {
      wordmark: "a bold horizontal wordmark using the full artist name",
      monogram: `a monogram using only the initials of "${artistName}"`,
      stacked: `a stacked logo with the artist name on top and "${tagline || "Music"}" below in smaller text`,
    }[style];

    const prompt = `Generate a self-contained SVG logo for a music artist.
Artist name: "${artistName}"
${tagline ? `Tagline: "${tagline}"` : ""}
Vibe: ${vibe || "bold, modern, dark"}
Style: ${styleDesc}

Rules — follow ALL of these strictly:
- Return ONLY the raw SVG code, nothing else, no markdown, no explanation
- viewBox must be exactly "0 0 400 200"
- Dark background rectangle covering the full viewBox
- Use only SVG primitives: rect, text, circle, line, path, polygon
- No external fonts — use font-family="Arial Black, Impact, sans-serif" or similar system fonts
- No images or foreign objects
- Bold, strong typography — make the artist name the hero
- Apply the vibe aesthetically through shapes, spacing, and color
- Accent color should be #22c55e (green) used sparingly for highlights`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6" });
    const raw = typeof result === "string" ? result : result?.text || result?.content || "";
    // Extract SVG block
    const match = raw.match(/<svg[\s\S]*<\/svg>/i);
    setSvgCode(match ? match[0] : raw.trim());
    setLoading(false);
  };

  const download = () => {
    if (!svgCode) return;
    const blob = new Blob([svgCode], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artistName.replace(/\s+/g, "-").toLowerCase()}-logo.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const save = () => {
    if (!svgCode) return;
    onSave("logo", { svg: svgCode, artistName, tagline, style, createdAt: new Date().toISOString() });
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Artist Name *</label>
          <Input placeholder="e.g. NOVA" value={artistName} onChange={e => setArtistName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Tagline or Genre (optional)</label>
          <Input placeholder="e.g. Trap Soul · Atlanta" value={tagline} onChange={e => setTagline(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Describe the Vibe</label>
        <textarea
          value={vibe}
          onChange={e => setVibe(e.target.value)}
          placeholder="minimal and luxury, all-caps block letters, streetwear energy, vintage soul with modern edge..."
          className="w-full h-20 rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Logo Style</label>
        <div className="grid grid-cols-3 gap-3">
          {STYLES.map(s => (
            <button key={s.id} onClick={() => setStyle(s.id)}
              className={`rounded-xl border p-4 text-left transition-all ${style === s.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40 text-foreground"}`}>
              <p className="font-semibold text-sm">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={generate} disabled={loading || !artistName.trim()} className="gap-2 w-full sm:w-auto">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
        {loading ? "Generating..." : "Generate Logo"}
      </Button>

      {svgCode && (
        <div className="space-y-4">
          {/* Main preview */}
          <div className="rounded-2xl border border-border overflow-hidden bg-zinc-950 flex items-center justify-center p-6 min-h-[220px]">
            <div dangerouslySetInnerHTML={{ __html: svgCode }} className="w-full max-w-[400px]" />
          </div>

          {/* Color variations */}
          <div className="grid grid-cols-3 gap-3">
            {COLOR_VARIANTS.map(v => (
              <div key={v.id} className="rounded-xl border border-border overflow-hidden">
                <div className="h-16 flex items-center justify-center" style={{ backgroundColor: v.bg }}>
                  <span className="font-heading font-bold text-lg tracking-widest" style={{ color: v.text }}>
                    {artistName.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground text-center py-1.5 bg-card">{v.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={generate} disabled={loading} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
            <Button variant="outline" onClick={download} className="gap-2">
              <Download className="h-4 w-4" /> Download SVG
            </Button>
            <Button onClick={save} disabled={saved} className="gap-2">
              <Save className="h-4 w-4" /> {saved ? "Saved!" : "Save Logo"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}