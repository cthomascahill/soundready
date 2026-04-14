import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

function addWrappedText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export default function DownloadPDF({ report = {}, song = {} }) {
  const [loading, setLoading] = useState(false);

  const generate = () => {
    setLoading(true);
    setTimeout(() => {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const W = 210;
      const MARGIN = 18;
      const contentW = W - MARGIN * 2;
      let y = 0;

      // ── Header bar ──────────────────────────────────────────────────
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, W, 28, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("SoundReady", MARGIN, 12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("AI Release Plan Report", MARGIN, 20);
      doc.text(`Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, W - MARGIN, 20, { align: "right" });

      y = 40;

      // ── Song info ───────────────────────────────────────────────────
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 10, 10);
      doc.text(song.title || "Untitled", MARGIN, y);
      y += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`${song.artist || ""}  ·  ${song.genre || ""}  ·  ${song.mood || ""}  ·  ${song.energy || ""} Energy`, MARGIN, y);
      y += 4;
      doc.setDrawColor(220, 220, 220);
      doc.line(MARGIN, y + 2, W - MARGIN, y + 2);
      y += 10;

      const sectionHeader = (title) => {
        doc.setFillColor(245, 250, 246);
        doc.roundedRect(MARGIN, y, contentW, 8, 1, 1, "F");
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 163, 74);
        doc.text(title.toUpperCase(), MARGIN + 4, y + 5.5);
        y += 12;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(9.5);
      };

      const checkPage = (needed = 20) => {
        if (y + needed > 278) { doc.addPage(); y = 18; }
      };

      // ── Algorithm Outlook ──────────────────────────────────────────
      checkPage(30);
      sectionHeader("Algorithm Outlook");
      (report.algorithm_outlook || []).forEach((point, i) => {
        checkPage(16);
        doc.setTextColor(22, 163, 74);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(`${i + 1}.`, MARGIN, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(9.5);
        const lines = doc.splitTextToSize(point, contentW - 8);
        doc.text(lines, MARGIN + 6, y);
        y += lines.length * 5.5 + 2;
      });
      y += 4;

      // ── Best Clip Moments ──────────────────────────────────────────
      if (report.best_clip_moments?.length) {
        checkPage(30);
        sectionHeader("Best Clip Moments");
        report.best_clip_moments.forEach((m) => {
          checkPage(18);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(30, 30, 30);
          doc.text(m.moment, MARGIN, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          const lines = doc.splitTextToSize(m.why, contentW);
          doc.text(lines, MARGIN, y);
          y += lines.length * 5 + 4;
        });
        y += 2;
      }

      // ── Content Video Ideas ────────────────────────────────────────
      if (report.content_video_ideas?.length) {
        checkPage(30);
        sectionHeader("Content Video Ideas");
        report.content_video_ideas.forEach((v) => {
          checkPage(18);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(30, 30, 30);
          doc.text(`${v.title}  [${v.platform}]`, MARGIN, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          const lines = doc.splitTextToSize(v.description, contentW);
          doc.text(lines, MARGIN, y);
          y += lines.length * 5 + 4;
        });
        y += 2;
      }

      // ── Release Plan ───────────────────────────────────────────────
      if (report.release_day) {
        checkPage(30);
        sectionHeader("Release Strategy");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(22, 163, 74);
        doc.text(`Ideal Release: ${report.release_day}`, MARGIN, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        if (report.release_day_reason) {
          const lines = doc.splitTextToSize(report.release_day_reason, contentW);
          doc.text(lines, MARGIN, y);
          y += lines.length * 5 + 5;
        }
        (report.pre_release_plan || []).forEach((d) => {
          checkPage(12);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(30, 30, 30);
          doc.text(d.day + ":", MARGIN, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          const lines = doc.splitTextToSize(d.action, contentW - 25);
          doc.text(lines, MARGIN + 25, y);
          y += Math.max(lines.length * 5, 5) + 2;
        });
        y += 4;
      }

      // ── Playlist Pitch ─────────────────────────────────────────────
      if (report.playlist_pitch) {
        checkPage(30);
        sectionHeader("Playlist Pitch");
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        y = addWrappedText(doc, `"${report.playlist_pitch}"`, MARGIN, y, contentW, 5.5);
        y += 6;
        if (report.genre_mood_tags?.length) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(100, 100, 100);
          doc.text("Tags: " + report.genre_mood_tags.join("  ·  "), MARGIN, y);
          y += 5;
        }
        if (report.similar_artists?.length) {
          doc.text("Sounds Like: " + report.similar_artists.join(", "), MARGIN, y);
          y += 8;
        }
      }

      // ── Social Captions ────────────────────────────────────────────
      const captions = report.captions || {};
      const captionKeys = ["instagram", "tiktok", "twitter", "wildcard_1", "wildcard_2"];
      const hasCaptions = captionKeys.some((k) => captions[k]);
      if (hasCaptions) {
        checkPage(30);
        sectionHeader("Social Media Captions");
        captionKeys.forEach((k) => {
          if (!captions[k]) return;
          checkPage(20);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(22, 163, 74);
          const label = k === "wildcard_1" ? "Wildcard 1" : k === "wildcard_2" ? "Wildcard 2" : k.charAt(0).toUpperCase() + k.slice(1);
          doc.text(label, MARGIN, y);
          y += 4.5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(50, 50, 50);
          const lines = doc.splitTextToSize(captions[k], contentW);
          doc.text(lines, MARGIN, y);
          y += lines.length * 5 + 5;
        });
      }

      // ── Footer on each page ────────────────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(180, 180, 180);
        doc.text(`SoundReady · ${song.title || "Release Plan"}`, MARGIN, 291);
        doc.text(`Page ${i} of ${pageCount}`, W - MARGIN, 291, { align: "right" });
      }

      doc.save(`${(song.title || "release-plan").replace(/\s+/g, "-").toLowerCase()}-soundready.pdf`);
      setLoading(false);
    }, 100);
  };

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={generate}
      disabled={loading}
      className="flex-1 h-12 font-heading font-semibold"
    >
      {loading ? (
        <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating PDF...</>
      ) : (
        <><Download className="h-4 w-4 mr-2" />Download PDF</>
      )}
    </Button>
  );
}