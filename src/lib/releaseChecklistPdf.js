import jsPDF from "jspdf";

// SoundReady-branded, print-ready release checklist. White paper, green header
// band, phase headings with a one-line goal, and empty checkboxes with a short
// "how" line under each step so the page works away from the screen.
const GREEN = [33, 196, 93];
const GREEN_INK = [16, 122, 62];
const INK = [17, 17, 17];
const MUTED = [108, 108, 108];

const LABEL_SIZE = 9.8;
const LABEL_LINE = 4.6;
const DETAIL_SIZE = 8.5;
const DETAIL_LINE = 4.1;
const INDENT = 8.5;

export function generateChecklistPDF({ title, subtitle, phases, filename }) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageW - margin * 2;
  const bottom = pageH - 22;
  let y = 0;

  // Header band
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageW, 34, "F");
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("S O U N D R E A D Y", margin, 11.5);
  doc.setFontSize(20);
  doc.text(title, margin, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Release Kit", pageW - margin, 11.5, { align: "right" });

  // Subtitle
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  let subtitleY = 43;
  doc.splitTextToSize(subtitle, maxWidth).forEach((line) => {
    doc.text(line, margin, subtitleY);
    subtitleY += 4.6;
  });
  y = subtitleY + 4;

  const newPage = () => {
    doc.addPage();
    y = margin;
  };

  const drawPhaseHeading = (phase, continued) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...GREEN_INK);
    doc.text(
      `${phase.label.toUpperCase()}${continued ? "  (CONTINUED)" : ""}`,
      margin,
      y
    );
    y += 2.4;
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + 18, y);
    y += 5.6;

    // The phase's one-line goal, only at the start of a phase
    if (!continued && phase.goal) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.4);
      doc.setTextColor(...MUTED);
      doc.splitTextToSize(phase.goal, maxWidth).forEach((line) => {
        doc.text(line, margin, y);
        y += 3.9;
      });
      y += 2.4;
    } else {
      y += 1.4;
    }
  };

  phases.forEach((phase) => {
    if (y + 36 > bottom) newPage();
    drawPhaseHeading(phase, false);

    phase.items.forEach((entry) => {
      const label = typeof entry === "string" ? entry : entry.label;
      const detail = typeof entry === "string" ? "" : entry.detail || "";

      doc.setFont("helvetica", "bold");
      doc.setFontSize(LABEL_SIZE);
      const labelLines = doc.splitTextToSize(label, maxWidth - INDENT);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(DETAIL_SIZE);
      const detailLines = detail ? doc.splitTextToSize(detail, maxWidth - INDENT) : [];

      const blockHeight =
        labelLines.length * LABEL_LINE +
        (detailLines.length ? detailLines.length * DETAIL_LINE + 1.8 : 0) +
        4.2;

      if (y + blockHeight > bottom) {
        newPage();
        drawPhaseHeading(phase, true);
      }

      // Checkbox aligned to the first line of the step
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y - 2.9, 3.8, 3.8, 0.8, 0.8, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(LABEL_SIZE);
      doc.setTextColor(...INK);
      labelLines.forEach((line, i) => doc.text(line, margin + INDENT, y + i * LABEL_LINE));
      y += labelLines.length * LABEL_LINE;

      if (detailLines.length) {
        y += 0.6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(DETAIL_SIZE);
        doc.setTextColor(...MUTED);
        detailLines.forEach((line, i) =>
          doc.text(line, margin + INDENT, y + i * DETAIL_LINE)
        );
        y += detailLines.length * DETAIL_LINE + 1.2;
      }

      y += 3;
    });

    y += 4;
  });

  // Footer on every page
  const pages = doc.getNumberOfPages();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 226, 226);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 15, pageW - margin, pageH - 15);
    doc.text("SoundReady · Release Kit · soundready.ai", margin, pageH - 10);
    doc.text(`${p} / ${pages}`, pageW - margin, pageH - 10, { align: "right" });
  }

  doc.save(filename);
}