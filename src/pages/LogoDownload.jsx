import { useState } from "react";
import { Download, FileCode2, FileImage, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import SoundReadyLogo from "@/components/SoundReadyLogo";

// 560x120 design canvas, exported at 4x (2240x480)
const SCALE = 4;
const W = 560;
const H = 120;

const SVG_FILE = `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="120" viewBox="0 0 560 120"><defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#35e273"/><stop offset="100%" stop-color="#14b050"/></linearGradient></defs><g transform="translate(4,4) scale(1.12)"><path d="M24 22 L24 78 L88 50 Z" fill="url(#bgGrad)" stroke="url(#bgGrad)" stroke-width="14" stroke-linejoin="round"/><path d="M30 74 C 48 67, 62 58, 79 34 M79 34 L75 49 M79 34 L66 35" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g><text x="137" y="84" font-family="'Space Grotesk', Arial, sans-serif" font-weight="900" font-size="70" letter-spacing="-1.75"><tspan fill="#ffffff">sound</tspan><tspan fill="#1ad05f">ready</tspan></text></svg>`;



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
  const g = ctx.createLinearGradient(17, 15, 95, 85); // lighter top-left, darker bottom-right
  g.addColorStop(0, "#35e273");
  g.addColorStop(1, "#14b050");
  ctx.fillStyle = g;
  ctx.strokeStyle = g;
  ctx.lineWidth = 14;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(24, 22); ctx.lineTo(24, 78); ctx.lineTo(88, 50);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Curved white arrow sweeping up to the upper right
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(30, 74);
  ctx.bezierCurveTo(48, 67, 62, 58, 79, 34);
  ctx.moveTo(79, 34); ctx.lineTo(75, 49);
  ctx.moveTo(79, 34); ctx.lineTo(66, 35);
  ctx.stroke();
  ctx.restore();

  // Wordmark: dark-theme colors, exactly as in the top bar
  ctx.font = `900 ${70 * SCALE}px "Space Grotesk", Arial, sans-serif`;
  try { ctx.letterSpacing = `${-1.75 * SCALE}px`; } catch {
    // older browsers: default spacing
  }
  const x = 137 * SCALE;
  const y = 84 * SCALE;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("sound", x, y);
  ctx.fillStyle = "#1ad05f";
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