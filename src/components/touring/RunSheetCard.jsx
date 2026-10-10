import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Pencil, Trash2, MapPin } from "lucide-react";

const fmtDate = (d) => {
  try {
    return new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return d;
  }
};

const TIMES = [
  ["load_in", "Load-in"],
  ["soundcheck", "Soundcheck"],
  ["doors", "Doors"],
  ["set_time", "Set"],
  ["set_length", "Length"],
];

const LINES = [
  ["parking", "Parking / Loading"],
  ["contact_name", "Contact"],
  ["contact_phone", "Phone"],
  ["deal_note", "Deal"],
  ["merch_note", "Merch"],
  ["notes", "Notes"],
];

export default function RunSheetCard({ sheet, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const text = [
      `SHOW-DAY RUN SHEET — ${fmtDate(sheet.show_date)}`,
      `${sheet.venue}${sheet.city ? ` — ${sheet.city}` : ""}`,
      "",
      `Load-in: ${sheet.load_in || "TBD"}   Soundcheck: ${sheet.soundcheck || "TBD"}   Doors: ${sheet.doors || "TBD"}`,
      `Set: ${sheet.set_time || "TBD"} (${sheet.set_length || "TBD"})`,
      `Parking / loading: ${sheet.parking || "TBD"}`,
      `Venue contact: ${sheet.contact_name || "TBD"}${sheet.contact_phone ? ` — ${sheet.contact_phone}` : ""}`,
      `Deal: ${sheet.deal_note || "TBD"}`,
      `Merch: ${sheet.merch_note || "TBD"}`,
      sheet.notes ? `Notes: ${sheet.notes}` : "",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-teal-500/20 bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading font-bold text-lg leading-tight">{sheet.venue}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {fmtDate(sheet.show_date)}{sheet.city && (<><span>·</span><MapPin className="h-3 w-3" />{sheet.city}</>)}
          </p>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-wide">
          {fmtDate(sheet.show_date).split(",")[0]}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {TIMES.map(([key, label]) => (
          <div key={key} className="rounded-lg bg-teal-500/5 border border-teal-500/20 px-2.5 py-2 text-center">
            <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wide">{label}</p>
            <p className="text-xs font-semibold mt-0.5 truncate">{sheet[key] || "—"}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        {LINES.filter(([key]) => sheet[key]).map(([key, label]) => (
          <p key={key} className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">{label}:</span> {sheet[key]}
          </p>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" variant="outline" onClick={copy} className="gap-1.5">
          {copied ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy for the band"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(sheet)} className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(sheet)} className="gap-1.5 text-red-400 hover:text-red-300">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}