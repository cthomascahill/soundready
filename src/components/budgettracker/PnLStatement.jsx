import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PnLStatement({ selected, totals }) {
  if (!selected || !totals) return null;

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 15;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(70, 222, 128); // Primary green
    doc.text('PROFIT & LOSS STATEMENT', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`For Review By: Accountant/Tax Professional`, pageWidth / 2, y, { align: 'center' });
    y += 8;

    // Artist & Song Info
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Release Information', 15, y);
    y += 6;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const infoY = y;
    doc.text(`Artist: ${selected.artist_name || 'N/A'}`, 15, infoY);
    doc.text(`Song: ${selected.song_title || 'N/A'}`, 15, infoY + 5);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 15, infoY + 10);
    y = infoY + 16;

    // P&L Table
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Statement of Income and Expenses', 15, y);
    y += 8;

    const col1X = 15;
    const col2X = 130;
    const colWidth = 60;

    // Table header
    doc.setFillColor(220, 220, 220);
    doc.rect(col1X, y - 5, colWidth, 6, 'F');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Description', col1X + 2, y - 1);
    doc.text('Amount', col2X + 8, y - 1, { align: 'right' });
    y += 8;

    // Revenue section
    doc.setTextColor(70, 222, 128);
    doc.setFontSize(10);
    doc.text('REVENUE', col1X, y);
    y += 6;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    if ((selected.revenue_streams || []).length === 0) {
      doc.text('No revenue recorded', col1X + 3, y);
      y += 5;
    } else {
      (selected.revenue_streams || []).forEach((r) => {
        const text = `${r.source || r.category}: ${r.description || ''}`;
        const wrappedText = doc.splitTextToSize(text, colWidth - 6);
        wrappedText.forEach((line) => {
          doc.text(line, col1X + 3, y);
          y += 4;
        });
        doc.text(`$${(r.amount || 0).toFixed(2)}`, col2X + 8, y - 4, { align: 'right' });
      });
    }
    y += 3;

    // Total revenue
    doc.setFillColor(240, 240, 240);
    doc.rect(col1X, y - 4, colWidth, 6, 'F');
    doc.setTextColor(70, 222, 128);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Total Revenue', col1X + 3, y);
    doc.text(`$${(totals.revenue || 0).toFixed(2)}`, col2X + 8, y, { align: 'right' });
    doc.setFont(undefined, 'normal');
    y += 10;

    // Expenses section
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(10);
    doc.text('EXPENSES', col1X, y);
    y += 6;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    if ((selected.expenses || []).length === 0) {
      doc.text('No expenses recorded', col1X + 3, y);
      y += 5;
    } else {
      (selected.expenses || []).forEach((e) => {
        const text = `${e.category}: ${e.description || ''}`;
        const wrappedText = doc.splitTextToSize(text, colWidth - 6);
        wrappedText.forEach((line) => {
          doc.text(line, col1X + 3, y);
          y += 4;
        });
        doc.text(`$${(e.amount || 0).toFixed(2)}`, col2X + 8, y - 4, { align: 'right' });
      });
    }
    y += 3;

    // Total expenses
    doc.setFillColor(240, 240, 240);
    doc.rect(col1X, y - 4, colWidth, 6, 'F');
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Total Expenses', col1X + 3, y);
    doc.text(`$${(totals.expenses || 0).toFixed(2)}`, col2X + 8, y, { align: 'right' });
    doc.setFont(undefined, 'normal');
    y += 10;

    // Net profit/loss
    const netProfit = totals.revenue - totals.expenses;
    const fillColor = netProfit >= 0 ? [220, 252, 231] : [254, 226, 226];
    doc.setFillColor(...fillColor);
    doc.rect(col1X, y - 4, colWidth, 8, 'F');
    const textColor = netProfit >= 0 ? [22, 163, 74] : [220, 38, 38];
    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('NET PROFIT/LOSS', col1X + 3, y);
    doc.text(`$${netProfit.toFixed(2)}`, col2X + 8, y, { align: 'right' });
    doc.setFont(undefined, 'normal');
    y += 10;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This document is for informational purposes. Please consult with a tax professional.', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Download
    doc.save(`${selected.artist_name}_${selected.song_title}_PnL.pdf`);
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-heading font-bold text-lg">P&L Statement</p>
          <p className="text-xs text-muted-foreground">Professional income statement for your accountant</p>
        </div>
        <Button onClick={generatePDF} variant="outline" className="gap-2 shrink-0">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Summary display */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <span className="text-muted-foreground">Total Revenue</span>
          <span className="font-bold text-primary">${(totals.revenue || 0).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <span className="text-muted-foreground">Total Expenses</span>
          <span className="font-bold text-destructive">${(totals.expenses || 0).toFixed(2)}</span>
        </div>
        <div className={`flex items-center justify-between pt-1 px-3 py-2 rounded-lg ${(totals.revenue - totals.expenses) >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
          <span className={`font-semibold ${(totals.revenue - totals.expenses) >= 0 ? "text-primary" : "text-destructive"}`}>Net Profit/Loss</span>
          <span className={`font-bold text-lg ${(totals.revenue - totals.expenses) >= 0 ? "text-primary" : "text-destructive"}`}>
            ${(totals.revenue - totals.expenses).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}