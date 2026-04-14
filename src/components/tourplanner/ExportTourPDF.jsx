import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import moment from "moment";

function fmt(n) {
  return `$${Number(n || 0).toFixed(0)}`;
}

function formatDuration(h) {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export default function ExportTourPDF({ venues, tasks, routeData, travelGapsByDate }) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const margin = 18;
    let y = margin;

    const pageBreakIfNeeded = (needed = 16) => {
      if (y + needed > H - margin) {
        doc.addPage();
        y = margin;
        drawHeader();
      }
    };

    const drawHeader = () => {
      // Top bar
      doc.setFillColor(34, 197, 94); // primary green
      doc.rect(0, 0, W, 10, "F");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("SOUNDREADY — TOUR ITINERARY", margin, 6.5);
      doc.text(`Generated ${moment().format("MMM D, YYYY")}`, W - margin, 6.5, { align: "right" });
      doc.setTextColor(30, 30, 30);
    };

    drawHeader();
    y = 18;

    // Title block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 30, 30);
    doc.text("Tour Itinerary", margin, y);
    y += 7;

    const bookedVenues = venues.filter(v => v.performance_date).sort((a, b) => a.performance_date > b.performance_date ? 1 : -1);
    if (bookedVenues.length > 0) {
      const first = moment(bookedVenues[0].performance_date).format("MMM D");
      const last = moment(bookedVenues[bookedVenues.length - 1].performance_date).format("MMM D, YYYY");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`${first} – ${last}  ·  ${bookedVenues.length} Shows`, margin, y);
      y += 4;
    }

    // Total travel hours
    const totalHours = Object.values(travelGapsByDate).reduce((sum, { from, to }) => {
      const key = `${from.city},${from.state}|${to.city},${to.state}`;
      const route = routeData[key];
      return sum + (route?.durationHours || 0);
    }, 0);
    if (totalHours > 0) {
      doc.text(`Total Driving: ${formatDuration(totalHours)}`, margin, y);
      y += 4;
    }

    const hotelTasks = tasks.filter(t => t.category === "Hotel" && t.cost);
    const totalHotelCost = hotelTasks.reduce((s, t) => s + (t.cost || 0), 0);
    const totalLogisticsCost = tasks.reduce((s, t) => s + (t.cost || 0), 0);

    if (totalLogisticsCost > 0) {
      doc.text(`Est. Logistics Budget: ${fmt(totalLogisticsCost)}  (Hotels: ${fmt(totalHotelCost)})`, margin, y);
      y += 4;
    }

    y += 6;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, y, W - margin, y);
    y += 8;

    // Build timeline: merge shows + travel gaps + tasks by date
    const allDates = new Set([
      ...bookedVenues.map(v => moment(v.performance_date).format("YYYY-MM-DD")),
      ...Object.keys(travelGapsByDate),
      ...tasks.map(t => t.date),
    ]);
    const sortedDates = [...allDates].sort();

    sortedDates.forEach(date => {
      const dayShows = bookedVenues.filter(v => moment(v.performance_date).format("YYYY-MM-DD") === date);
      const travelGap = travelGapsByDate[date];
      const dayTasks = tasks.filter(t => t.date === date);

      if (dayShows.length === 0 && !travelGap && dayTasks.length === 0) return;

      pageBreakIfNeeded(20);

      // Date header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(moment(date).format("dddd, MMMM D"), margin, y);
      y += 5;

      // Shows
      dayShows.forEach(v => {
        pageBreakIfNeeded(14);
        doc.setFillColor(34, 197, 94);
        doc.setDrawColor(34, 197, 94);
        doc.roundedRect(margin, y - 3.5, W - margin * 2, 12, 2, 2, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(`🎤  ${v.name}`, margin + 3, y + 2);
        const rightText = [v.city, v.state].filter(Boolean).join(", ");
        doc.text(rightText, W - margin - 3, y + 2, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const details = [];
        if (v.capacity) details.push(`Cap: ${v.capacity}`);
        if (v.payout_received) details.push(`Payout: ${fmt(v.payout_received)}`);
        if (v.pay_range && !v.payout_received) details.push(`Est: ${v.pay_range}`);
        if (v.soundcheck_time) details.push(`Soundcheck: ${v.soundcheck_time}`);
        doc.text(details.join("  ·  "), margin + 3, y + 7);
        doc.setTextColor(30, 30, 30);
        y += 16;
      });

      // Travel gap
      if (travelGap) {
        pageBreakIfNeeded(14);
        const key = `${travelGap.from.city},${travelGap.from.state}|${travelGap.to.city},${travelGap.to.state}`;
        const route = routeData[key];
        const isLong = route && route.durationHours > 8;

        doc.setFillColor(isLong ? 254 : 249, isLong ? 226 : 215, isLong ? 226 : 160);
        doc.setDrawColor(isLong ? 239 : 234, isLong ? 68 : 179, isLong ? 68 : 8);
        doc.roundedRect(margin, y - 3.5, W - margin * 2, 10, 2, 2, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(isLong ? 153 : 120, isLong ? 27 : 80, isLong ? 27 : 0);
        const travelText = `➤  Travel: ${travelGap.from.city} → ${travelGap.to.city}`;
        doc.text(travelText, margin + 3, y + 1.5);
        if (route) {
          doc.setFont("helvetica", "normal");
          doc.text(`${route.distanceMiles} mi · ${formatDuration(route.durationHours)}${isLong ? "  ⚠ Long haul" : ""}`, W - margin - 3, y + 1.5, { align: "right" });
        }
        doc.setTextColor(30, 30, 30);
        y += 12;
      }

      // Tasks
      if (dayTasks.length > 0) {
        dayTasks.forEach(task => {
          pageBreakIfNeeded(7);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 80);
          const status = task.status === "Done" ? "✓" : task.status === "In Progress" ? "◑" : "○";
          const costStr = task.cost ? `  ${fmt(task.cost)}` : "";
          doc.text(`  ${status}  [${task.category}]  ${task.title}${costStr}${task.notes ? `  — ${task.notes}` : ""}`, margin + 2, y);
          y += 5.5;
        });
        y += 1;
      }

      y += 3;
    });

    // ─── Financial Summary Page ───────────────────────────────────────────────
    doc.addPage();
    y = margin;
    drawHeader();
    y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text("Financial Summary", margin, y);
    y += 10;

    const totalPayout = bookedVenues.reduce((s, v) => s + Number(v.payout_received || 0), 0);
    const totalTaskCost = tasks.reduce((s, t) => s + (t.cost || 0), 0);

    const summaryRows = [
      ["Total Show Payouts", fmt(totalPayout)],
      ["Hotel / Lodging Budget", fmt(totalHotelCost)],
      ["Total Logistics Cost", fmt(totalTaskCost)],
      ["Estimated Net", fmt(totalPayout - totalTaskCost)],
      ["Total Driving Hours", totalHours > 0 ? formatDuration(totalHours) : "N/A"],
    ];

    summaryRows.forEach(([label, value], i) => {
      doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 248 : 255);
      doc.rect(margin, y - 4, W - margin * 2, 8, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(label, margin + 3, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(value, W - margin - 3, y, { align: "right" });
      y += 9;
    });

    y += 6;

    // Show roster table
    if (bookedVenues.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text("Show Roster", margin, y);
      y += 7;

      // Table header
      const cols = [margin, margin + 40, margin + 80, margin + 120, margin + 150];
      ["Date", "Venue", "City", "Capacity", "Payout"].forEach((h, i) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(h, cols[i], y);
      });
      y += 2;
      doc.setLineWidth(0.3);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, W - margin, y);
      y += 5;

      bookedVenues.forEach((v, i) => {
        pageBreakIfNeeded(7);
        if (i % 2 === 0) {
          doc.setFillColor(248, 250, 248);
          doc.rect(margin, y - 3.5, W - margin * 2, 6.5, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(40, 40, 40);
        doc.text(moment(v.performance_date).format("MMM D"), cols[0], y);
        doc.text((v.name || "").substring(0, 20), cols[1], y);
        doc.text((v.city || "").substring(0, 18), cols[2], y);
        doc.text(v.capacity ? String(v.capacity) : "—", cols[3], y);
        doc.text(v.payout_received ? fmt(v.payout_received) : (v.pay_range || "TBD"), cols[4], y);
        y += 7;
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(`Page ${p} of ${pageCount}  ·  SoundReady Tour Itinerary  ·  Confidential`, W / 2, H - 8, { align: "center" });
    }

    doc.save(`tour-itinerary-${moment().format("YYYY-MM-DD")}.pdf`);
    setGenerating(false);
  };

  return (
    <Button onClick={generatePDF} disabled={generating} variant="outline" className="gap-2">
      {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {generating ? "Generating PDF..." : "Export Itinerary PDF"}
    </Button>
  );
}