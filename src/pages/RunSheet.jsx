import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import RunSheetCard from "@/components/touring/RunSheetCard";
import RunSheetForm from "@/components/touring/RunSheetForm";

export default function RunSheet() {
  const [sheets, setSheets] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () =>
    base44.entities.ShowRunSheet.filter({}, { sort: "show_date", limit: 100 })
      .then((page) => setSheets(page.items))
      .catch(() => setSheets([]));

  useEffect(() => {
    load();
    const unsub = base44.entities.ShowRunSheet.subscribe(() => load());
    return unsub;
  }, []);

  const remove = async (sheet) => {
    if (!window.confirm(`Delete the run sheet for ${sheet.venue}?`)) return;
    await base44.entities.ShowRunSheet.delete(sheet.id);
    load();
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <SEO title="Show Run Sheet — SoundReady" description="The day-of game plan for every gig: load-in, soundcheck, doors, set time, parking, contacts and merch notes." />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs text-teal-400 uppercase tracking-widest font-bold">Touring</p>
          <h1 className="font-heading text-4xl font-bold flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-teal-400" /> Show Run Sheet
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            Everything the band and crew need on show day — times, parking, venue contact, deal and merch — in one card you can copy and send.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New Run Sheet
        </Button>
      </div>

      {sheets === null ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : sheets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="font-heading font-bold">No run sheets yet</p>
          <p className="text-sm text-muted-foreground">Create one for your next show so nobody's texting "what time is load-in?" on the day.</p>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> New Run Sheet
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sheets.map((sheet) => (
            <RunSheetCard key={sheet.id} sheet={sheet} onEdit={(s) => { setEditing(s); setFormOpen(true); }} onDelete={remove} />
          ))}
        </div>
      )}

      <RunSheetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSaved={load}
      />
    </div>
  );
}