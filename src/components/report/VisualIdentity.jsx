import { Palette } from "lucide-react";
import ReportCard, { CardHeader } from "./ReportCard";

const MOOD_PALETTES = {
  Happy: { colors: ["#FFD166", "#F4A261", "#FFFFFF"], photo: "Bright, sun-drenched golden hour shots with warm tones, open spaces, and natural smiles — think summer afternoons and genuine joy.", filter: "Warm vintage filter with lifted shadows and a subtle golden color grade.", fonts: { heading: "Syne", body: "DM Sans" }, aesthetic: ["vibrant", "warm", "joyful"] },
  Melancholic: { colors: ["#2D3047", "#8ECAE6", "#E0E0E0"], photo: "Muted, desaturated photography with moody window light, empty rooms, and solitary figures — intimacy over spectacle.", filter: "Cool-toned film grain filter with crushed blacks and slightly faded highlights.", fonts: { heading: "Playfair Display", body: "Lato" }, aesthetic: ["cinematic", "intimate", "melancholic"] },
  Hype: { colors: ["#FF006E", "#FB5607", "#FFBE0B"], photo: "High-contrast, saturated action shots with motion blur, neon lighting, and crowd energy — everything in motion.", filter: "High saturation, punchy contrast filter with a slight red push in the highlights.", fonts: { heading: "Bebas Neue", body: "Inter" }, aesthetic: ["bold", "electric", "raw"] },
  Romantic: { colors: ["#FFAFCC", "#CDB4DB", "#FFC8DD"], photo: "Soft, dreamy close-ups with warm backlight, shallow depth of field, and candid intimate moments — feel, don't pose.", filter: "Soft pastel filter with lifted blacks and a warm pink tint in the shadows.", fonts: { heading: "Cormorant Garamond", body: "Nunito" }, aesthetic: ["dreamy", "tender", "ethereal"] },
  Dark: { colors: ["#0D0D0D", "#E63946", "#FFFFFF"], photo: "High-contrast black and white or deep shadow photography — strong single-source lighting, dramatic angles, urban texture.", filter: "Gritty desaturated filter with deep shadows, high contrast, and a subtle red tint in highlights.", fonts: { heading: "Anton", body: "Space Mono" }, aesthetic: ["cinematic", "raw", "intense"] },
  Inspirational: { colors: ["#06D6A0", "#118AB2", "#FFFFFF"], photo: "Wide open landscapes, upward angles, and golden light — the subject always facing forward, never looking back.", filter: "Clean, slightly cooler filter with lifted exposure and teal tones in the midtones.", fonts: { heading: "Montserrat", body: "Open Sans" }, aesthetic: ["expansive", "hopeful", "powerful"] },
  Chill: { colors: ["#A8DADC", "#457B9D", "#F1FAEE"], photo: "Lo-fi aesthetic photography — soft natural light, bedroom settings, plants, coffee cups, and quiet moments of stillness.", filter: "Washed-out film aesthetic with a slight blue-green tint and soft vignette.", fonts: { heading: "Raleway", body: "Merriweather" }, aesthetic: ["minimal", "calm", "organic"] },
};

const DEFAULT_PALETTE = {
  colors: ["#1A1A2E", "#16213E", "#E94560"],
  photo: "Moody, low-key photography with dramatic single-source lighting and strong visual contrast between subject and environment.",
  filter: "Deep shadow filter with a subtle cinematic color grade pushing toward teal and orange.",
  fonts: { heading: "Space Grotesk", body: "Inter" },
  aesthetic: ["cinematic", "bold", "atmospheric"],
};

export default function VisualIdentity({ song = {} }) {
  const palette = MOOD_PALETTES[song.mood] || DEFAULT_PALETTE;

  return (
    <ReportCard borderColor="border-l-pink-500">
      <CardHeader icon={Palette} title="Visual Identity Guide" iconColor="text-pink-400" badge="Section 10" />
      <p className="text-sm text-muted-foreground -mt-2">Your complete visual direction based on <span className="text-foreground font-medium">{song.mood || "your"}</span> mood and <span className="text-foreground font-medium">{song.genre || "your"}</span> genre.</p>

      {/* Color swatches */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Brand Color Palette</p>
        <div className="flex gap-3">
          {palette.colors.map((hex) => (
            <div key={hex} className="flex flex-col items-center gap-1.5">
              <div className="h-12 w-12 rounded-xl border border-border shadow-sm" style={{ backgroundColor: hex }} />
              <span className="text-[10px] text-muted-foreground font-mono">{hex}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Photography */}
        <div className="space-y-1.5 p-4 rounded-xl bg-secondary/30 border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Photography Style</p>
          <p className="text-sm text-foreground/85 leading-relaxed">{palette.photo}</p>
        </div>
        {/* Filter */}
        <div className="space-y-1.5 p-4 rounded-xl bg-secondary/30 border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Instagram Filter Style</p>
          <p className="text-sm text-foreground/85 leading-relaxed">{palette.filter}</p>
        </div>
      </div>

      {/* Fonts */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Font Recommendations</p>
        <div className="flex gap-3 flex-wrap">
          <div className="px-4 py-2.5 rounded-xl bg-secondary/30 border border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Heading Font</p>
            <p className="font-semibold text-sm">{palette.fonts.heading}</p>
            <p className="text-[10px] text-muted-foreground">Google Fonts</p>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-secondary/30 border border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Body Font</p>
            <p className="font-semibold text-sm">{palette.fonts.body}</p>
            <p className="text-[10px] text-muted-foreground">Google Fonts</p>
          </div>
        </div>
      </div>

      {/* Aesthetic words */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Creative Brief Keywords</p>
        <div className="flex gap-2 flex-wrap">
          {palette.aesthetic.map((word) => (
            <span key={word} className="px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-sm font-medium">{word}</span>
          ))}
        </div>
      </div>
    </ReportCard>
  );
}