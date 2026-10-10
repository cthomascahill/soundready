import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const SECTIONS = [
  {
    heading: "The Show",
    fields: [
      { key: "show_date", label: "Show Date", type: "date" },
      { key: "venue", label: "Venue", placeholder: "e.g. The Blue Note" },
      { key: "city", label: "City / State", placeholder: "e.g. Denver, CO" },
    ],
  },
  {
    heading: "Times",
    fields: [
      { key: "load_in", label: "Load-In", placeholder: "e.g. 5:00 PM" },
      { key: "soundcheck", label: "Soundcheck", placeholder: "e.g. 6:00 PM" },
      { key: "doors", label: "Doors", placeholder: "e.g. 8:00 PM" },
      { key: "set_time", label: "Set Time", placeholder: "e.g. 9:30 PM" },
      { key: "set_length", label: "Set Length", placeholder: "e.g. 60 min" },
    ],
  },
  {
    heading: "Logistics",
    fields: [
      { key: "parking", label: "Parking / Loading", placeholder: "e.g. Load via alley, park on Elm St" },
      { key: "contact_name", label: "Venue Contact", placeholder: "e.g. Dana (booker)" },
      { key: "contact_phone", label: "Contact Phone", placeholder: "e.g. (555) 555-0100" },
    ],
  },
  {
    heading: "Money & Merch",
    fields: [
      { key: "deal_note", label: "Deal / Payment", placeholder: "e.g. $300 guarantee, paid at close of night" },
      { key: "merch_note", label: "Merch", placeholder: "e.g. Table by the bar, venue takes 10%" },
    ],
  },
  {
    heading: "Notes",
    fields: [
      { key: "notes", label: "Anything the band and crew need to know", placeholder: "e.g. Two acts on the bill, backline kit provided", full: true },
    ],
  },
];

export default function RunSheetForm({ open, onOpenChange, initial, onSaved }) {
  const [f, setF] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setF(initial || {});
      setError("");
    }
  }, [open, initial]);

  const set = (key, value) => setF((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!f.venue || !f.show_date) {
      setError("Venue and show date are required.");
      return;
    }
    setSaving(true);
    try {
      if (initial?.id) {
        await base44.entities.ShowRunSheet.update(initial.id, f);
      } else {
        await base44.entities.ShowRunSheet.create(f);
      }
      onOpenChange(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Run Sheet" : "New Show Run Sheet"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {SECTIONS.map((section) => (
            <div key={section.heading} className="space-y-3">
              <p className="text-xs text-primary uppercase tracking-widest font-bold">{section.heading}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.fields.map((field) => (
                  <div key={field.key} className={`space-y-1.5 ${field.full ? "sm:col-span-2" : ""}`}>
                    <label className="text-xs text-muted-foreground font-medium">{field.label}</label>
                    <Input
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      value={f[field.key] || ""}
                      onChange={(e) => set(field.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {initial?.id ? "Save Changes" : "Create Run Sheet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}