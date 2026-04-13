import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

function getGrade(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 50) return "C+";
  return "C";
}

function scoreBar(doc, x, y, label, score, color) {
  const barW = 110;
  doc.setFontSize(8.5);
  doc.setTextColor(160, 160, 160);
  doc.text(label, x, y);
  doc.setTextColor(220, 220, 220);
  doc.setFontSize(8.5);
  doc.text(String(score ?? "—"), x + barW + 6, y);

  // track bg
  doc.setFillColor(40, 40, 40);
  doc.roundedRect(x, y + 2, barW, 5, 1.5, 1.5, "F");

  // fill
  const fill = Math.min(100, Math.max(0, score || 0));
  doc.setFillColor(...color);
  doc.roundedRect(x, y + 2, (barW * fill) / 100, 5, 1.5, 1.5, "F");
}

export default function ExportReportPDF({ analysis }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210;
      const primaryGreen = [56, 189, 105];
      const darkBg = [14, 14, 14];
      const cardBg = [22, 22, 22];

      // ── Background
      doc.setFillColor(...darkBg);
      doc.rect(0, 0, W, 297, "F");

      // ── Header band
      doc.setFillColor(...cardBg);
      doc.rect(0, 0, W, 52, "F");

      // Brand accent line
      doc.setFillColor(...primaryGreen);
      doc.rect(0, 0, W, 1.5, "F");

      // Logo text
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryGreen);
      doc.text("SoundReady", 16, 14);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text("AI-Powered Music Analysis Report", 16, 20);

      // Date
      const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(dateStr, W - 16, 14, { align: "right" });

      // Song title + artist
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(240, 240, 240);
      doc.text(analysis.title || "Untitled", 16, 36);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      const subLine = [analysis.artist_name, analysis.genre, analysis.bpm_estimate].filter(Boolean).join("  ·  ");
      doc.text(subLine, 16, 44);

      // ── Overall Score circle area (right side of header)
      const cx = W - 30;
      const cy = 30;
      doc.setFillColor(56, 189, 105, 0.15);
      doc.setDrawColor(...primaryGreen);
      doc.setLineWidth(1.5);
      doc.circle(cx, cy, 18, "FD");

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryGreen);
      doc.text(String(analysis.overall_score ?? "—"), cx, cy + 3, { align: "center" });

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text("/ 100", cx, cy + 9, { align: "center" });

      const grade = getGrade(analysis.overall_score);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryGreen);
      doc.text(`Grade: ${grade}`, cx, cy + 16, { align: "center" });

      // ── Platform Scores section
      let y = 62;
      doc.setFillColor(...cardBg);
      doc.roundedRect(14, y, W - 28, 72, 3, 3, "F");

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryGreen);
      doc.text("PLATFORM PERFORMANCE", 20, y + 9);

      const platforms = [
        { label: "Spotify", score: analysis.spotify_score, color: [30, 215, 96] },
        { label: "Apple Music", score: analysis.apple_music_score, color: [252, 60, 68] },
        { label: "YouTube", score: analysis.youtube_score, color: [255, 0, 0] },
        { label: "TikTok", score: analysis.tiktok_score, color: [105, 201, 208] },
      ];

      platforms.forEach((p, i) => {
        const col = i < 2 ? 20 : W / 2 + 4;
        const row = y + 18 + (i % 2) * 22;
        scoreBar(doc, col, row, p.label, p.score, p.color);
      });

      // ── Quality Metrics
      y += 80;
      doc.setFillColor(...cardBg);
      doc.roundedRect(14, y, W - 28, 54, 3, 3, "F");

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryGreen);
      doc.text("QUALITY METRICS", 20, y + 9);

      const metrics = [
        { label: "Hook Strength", score: analysis.hook_strength, color: [251, 191, 36] },
        { label: "Production Quality", score: analysis.production_quality, color: [139, 92, 246] },
        { label: "Replay Value", score: analysis.replay_value, color: [59, 130, 246] },
      ];

      metrics.forEach((m, i) => {
        scoreBar(doc, 20, y + 18 + i * 13, m.label, m.score, m.color);
      });

      // ── Song Profile Tags
      y += 62;
      const tags = [analysis.mood, analysis.energy_level && `${analysis.energy_level} energy`, analysis.genre].filter(Boolean);
      if (tags.length) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryGreen);
        doc.text("SONG PROFILE", 16, y + 6);

        let tx = 16;
        tags.forEach((tag) => {
          doc.setFillColor(30, 30, 30);
          doc.setDrawColor(60, 60, 60);
          doc.setLineWidth(0.3);
          const tw = doc.getTextWidth(tag) + 6;
          doc.roundedRect(tx, y + 9, tw, 7, 1.5, 1.5, "FD");
          doc.setFontSize(7.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(200, 200, 200);
          doc.text(tag, tx + 3, y + 14.5);
          tx += tw + 3;
        });
        y += 22;
      }

      // ── Strengths
      const strengths = analysis.strengths || [];
      if (strengths.length) {
        y += 4;
        doc.setFillColor(...cardBg);
        doc.roundedRect(14, y, W - 28, 14 + strengths.length * 10, 3, 3, "F");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryGreen);
        doc.text("STRENGTHS", 20, y + 9);

        strengths.forEach((s, i) => {
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(56, 189, 105);
          doc.text("✓", 20, y + 18 + i * 10);
          doc.setTextColor(210, 210, 210);
          doc.text(s, 26, y + 18 + i * 10, { maxWidth: W - 52 });
        });
        y += 14 + strengths.length * 10 + 6;
      }

      // ── Recommendations
      const recs = analysis.recommendations || [];
      if (recs.length && y < 260) {
        doc.setFillColor(...cardBg);
        doc.roundedRect(14, y, W - 28, 14 + recs.length * 10, 3, 3, "F");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(251, 191, 36);
        doc.text("RECOMMENDATIONS", 20, y + 9);

        recs.forEach((r, i) => {
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(251, 191, 36);
          doc.text("→", 20, y + 18 + i * 10);
          doc.setTextColor(210, 210, 210);
          doc.text(r, 26, y + 18 + i * 10, { maxWidth: W - 52 });
        });
        y += 14 + recs.length * 10 + 6;
      }

      // ── Similar Artists
      const similar = (analysis.similar_artists || []).slice(0, 5);
      if (similar.length && y < 270) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryGreen);
        doc.text("SOUNDS LIKE", 16, y + 6);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(180, 180, 180);
        doc.text(similar.join("  ·  "), 16, y + 14, { maxWidth: W - 32 });
        y += 22;
      }

      // ── Footer
      doc.setFillColor(...cardBg);
      doc.rect(0, 285, W, 12, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text("Generated by SoundReady · soundready.app · Scores are AI-generated estimates based on current streaming algorithm trends.", W / 2, 292, { align: "center" });

      doc.save(`${analysis.title || "SoundReady"}_Analysis_Report.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={loading}
      variant="outline"
      className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Export PDF Report
    </Button>
  );
}