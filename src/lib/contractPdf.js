import jsPDF from "jspdf";

// Turns a contract template's plain text into a clean, wrapped, paginated PDF.
// Long lines wrap inside the margins, leading spaces become a real indent,
// headings stay with the text under them, and the signature block never splits.
export function generateContractPDF(template, fields) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 22;
  const maxWidth = pageWidth - margin * 2;
  const bottom = pageHeight - 22;
  const lineHeight = 5.2;
  let y = margin;

  const newPage = () => {
    doc.addPage();
    y = margin;
  };

  const lines = template.generate(fields).split("\n");

  lines.forEach((raw, i) => {
    const line = raw.replace(/\s+$/, "");

    if (!line.trim()) {
      y += lineHeight * 0.6;
      return;
    }

    const trimmed = line.trim();
    const isHeading =
      !line.startsWith(" ") &&
      trimmed.length > 3 &&
      trimmed === trimmed.toUpperCase() &&
      !/^\d/.test(trimmed) &&
      !trimmed.includes("____");

    if (isHeading) {
      // Title (first line) is larger and centered.
      if (i === 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        const titleLines = doc.splitTextToSize(trimmed, maxWidth);
        titleLines.forEach((t) => {
          doc.text(t, pageWidth / 2, y, { align: "center" });
          y += 7;
        });
        y += 2;
        return;
      }
      // Keep the signature block together on one page.
      const needed = trimmed === "SIGNATURES" ? 75 : lineHeight * 4;
      if (y + needed > bottom) newPage();
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(trimmed, margin, y);
      y += lineHeight + 1;
      return;
    }

    const leading = line.length - line.trimStart().length;
    const indent = Math.min(leading, 8) * 1.6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const wrapped = doc.splitTextToSize(trimmed, maxWidth - indent);
    wrapped.forEach((w) => {
      if (y + lineHeight > bottom) newPage();
      doc.text(w, margin + indent, y);
      y += lineHeight;
    });
  });

  // Page numbers
  const pages = doc.getNumberOfPages();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.text(`Page ${p} of ${pages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  }

  doc.save(`${template.id}_agreement.pdf`);
}