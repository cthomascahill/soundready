import jsPDF from "jspdf";

// SoundReady-branded, print-ready checklist PDF. White paper, green header
// band, phase headings and empty checkboxes the artist can tick by hand.
const GREEN = [33, 196, 93];
const GREEN_INK = [16, 122, 62];
const INK = [17, 17, 17];
const MUTED = [110, 110, 110];

export function generateChecklistPDF({ title, subtitle, phases, filename }) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageW - margin * 2;
  const bottom = pageH - 20;
  let y = 0;

  // Header band with the wordmark and the document title
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageW, 34, "F");
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("S O U N D R E A D Y", margin, 12);
  doc.setFontSize(20);
  doc.text(title, margin, 24);

  // Subtitle under the band
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  let subtitleY = 43;
  doc.splitTextToSize(subtitle, maxWidth).forEach((line) => {
    doc.text(line, margin, subtitleY);
    subtitleY += 4.6;
  });
  y = subtitleY + 5;

  const newPage = () => {
    doc.addPage();
    y = margin;
  };

  phases.forEach((phase) => {
    if (y + 16 > bottom) newPage();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...GREEN_INK);
    doc.text(phase.label.toUpperCase(), margin, y);
    y += 2.4;
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + 18, y);
    y += 7;

    phase.items.forEach((label) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(label, maxWidth - 10);
      const blockHeight = lines.length * 4.8 + 2.6;
      if (y + blockHeight > bottom) newPage();

      doc.setDrawColor(185, 185, 185);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y - 2.9, 3.8, 3.8, 0.8, 0.8, "S");

      doc.setTextColor(...INK);
      lines.forEach((line, i) => doc.text(line, margin + 8.5, y + i * 4.8));
      y += blockHeight;
    });

    y += 3;
  });

  // Footer on every page
  const pages = doc.getNumberOfPages();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.text("SoundReady · Release Kit", margin, pageH - 10);
    doc.text(`${p} / ${pages}`, pageW - margin, pageH - 10, { align: "right" });
  }

  doc.save(filename);
}