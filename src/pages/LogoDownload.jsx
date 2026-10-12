import { useState } from "react";
import { Download, FileCode2, FileImage, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import SoundReadyLogo from "@/components/SoundReadyLogo";

// 560x120 design canvas, exported at 4x (2240x480)
const SCALE = 4;
const W = 560;
const H = 120;

const SVG_FILE = `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="120" viewBox="0 0 560 120"><defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2ecc71"/><stop offset="100%" stop-color="#1a9e50"/></linearGradient></defs><g transform="translate(4,4) scale(1.12)"><path d="M10 92 L70 92 L108 50 L70 8 L10 8 Z" fill="#0a3d1e" transform="translate(3,4)"/><path d="M10 90 L68 90 L106 50 L68 10 L10 10 Z" fill="url(#bgGrad)"/><path d="M10 90 L38 90 L38 10 L10 10 Z" fill="#1a9e50" opacity="0.5"/><path d="M22 72 L50 44 L58 60 L78 36 M78 36 L78 50 M78 36 L64 36" stroke="white" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g><text x="137" y="84" font-family="'Space Grotesk', Arial, sans-serif" font-weight="900" font-size="70" letter-spacing="-1.75"><tspan fill="#fafafa">sound</tspan><tspan fill="#69f29b">ready</tspan></text></svg>`;

const poly = (ctx, pts) => {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.fill();
};

// Draws the exact top-bar logo (mark + wordmark) onto a canvas.
async function renderLogo(darkBackground) {
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");

  try {
    await document.fonts.load(`700 ${70 * SCALE}px "Space Grotesk"`);
  } catch {
    // fall back to system font below
  }

  if (darkBackground) {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Play-mark: same geometry as the top-bar logo
  ctx.save();
  ctx.translate(4 * SCALE, 4 * SCALE);
  ctx.scale(1.12 * SCALE, 1.12 * SCALE);
  poly(ctx, [[13, 96], [73, 96], [111, 54], [73, 12], [13, 12]]); // shadow
  const g = ctx.createLinearGradient(10, 10, 106, 90);
  g.addColorStop(0, "#2ecc71");
  g.addColorStop(1, "#1a9e50");
  ctx.fillStyle = g;
  poly(ctx, [[10, 90], [68, 90], [106, 50], [68, 10], [10, 10]]);
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = "#1a9e50";
  poly(ctx, [[10, 90], [38, 90], [38, 10], [10, 10]]);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 6.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(22, 72); ctx.lineTo(50, 44); ctx.lineTo(58, 60); ctx.lineTo(78, 36);
  ctx.moveTo(78, 36); ctx.lineTo(78, 50);
  ctx.moveTo(78, 36); ctx.lineTo(64, 36);
  ctx.stroke();
  ctx.restore();

  // Wordmark: dark-theme colors, exactly as in the top bar
  ctx.font = `900 ${70 * SCALE}px "Space Grotesk", Arial, sans-serif`;
  try { ctx.letterSpacing = `${-1.75 * SCALE}px`; } catch {
    // older browsers: default spacing
  }
  const x = 137 * SCALE;
  const y = 84 * SCALE;
  ctx.fillStyle = "#fafafa";
  ctx.fillText("sound", x, y);
  ctx.fillStyle = "#69f29b";
  ctx.fillText("ready", x + ctx.measureText("sound").width, y);

  return canvas;
}

const saveFile = (href, name) => {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/**
 * Brand asset download page: the top-bar logo as JPG, PNG and SVG,
 * rendered in the browser from the exact same geometry and colors.
 */
export default function LogoDownload() {
  const [busy, setBusy] = useState(null);

  const downloadJpg = async () => {
    setBusy("jpg");
    const canvas = await renderLogo(true); // JPG has no transparency, so it sits on the site's dark background
    saveFile(canvas.toDataURL("image/jpeg", 0.95), "soundready-logo.jpg");
    setBusy(null);
  };

  const downloadPng = async () => {
    setBusy("png");
    const canvas = await renderLogo(false); // transparent background
    saveFile(canvas.toDataURL("image/png"), "soundready-logo.png");
    setBusy(null);
  };

  const downloadSvg = () => {
    const blob = new Blob([SVG_FILE], { type: "image/svg+xml" });
    saveFile(URL.createObjectURL(blob), "soundready-logo.svg");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <SEO title="SoundReady logo — download" description="Download the SoundReady logo as JPG, PNG or SVG." />
      <div className="w-full max-w-xl space-y-6 text-center">
        <h1 className="font-heading text-3xl font-bold">The SoundReady logo</h1>
        <p className="text-sm text-muted-foreground">
          Exactly as it appears in the top bar. Pick a format and it downloads instantly.
        </p>

        <div className="rounded-2xl bg-[#0a0a0a] border border-border p-8 flex items-center justify-center">
          <SoundReadyLogo size={44} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button className="gap-2 font-semibold" disabled={!!busy} onClick={downloadJpg}>
            <ImageIcon className="h-4 w-4" /> {busy === "jpg" ? "Rendering..." : "Download JPG"}
          </Button>
          <Button variant="outline" className="gap-2 font-semibold" disabled={!!busy} onClick={downloadPng}>
            <FileImage className="h-4 w-4" /> {busy === "png" ? "Rendering..." : "Download PNG"}
          </Button>
          <Button variant="outline" className="gap-2 font-semibold" disabled={!!busy} onClick={downloadSvg}>
            <FileCode2 className="h-4 w-4" /> Download SVG
          </Button>
        </div>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Download className="h-3 w-3" /> JPG comes on the site's dark background; PNG has a transparent one.
        </p>
      </div>
    </div>
  );
}