import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Modal: add a client to the producer's CRM pipeline.
 */
export default function NewClientForm({ open, onClose, onSaved }) {
  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name").trim();
    if (!name) return;
    const client = await base44.entities.ProducerClient.create({
      name,
      email: fd.get("email") || undefined,
      sound: fd.get("sound") || undefined,
      beat_title: fd.get("beat_title") || undefined,
      terms: fd.get("terms") || undefined,
      notes: fd.get("notes") || undefined,
      source: "Manual",
      stage: "Prospect",
      last_contact_date: new Date().toISOString().split("T")[0],
    });
    onSaved(client);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 z-10"
      >
        <p className="font-heading font-bold text-lg">New Client</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Artist / Name *</label>
            <Input name="name" placeholder="e.g. Matt Corman" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Email</label>
            <Input name="email" type="email" placeholder="their contact email" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Their Sound</label>
            <Input name="sound" placeholder="e.g. melodic hip-hop" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Beat</label>
            <Input name="beat_title" placeholder="the beat this is about" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Terms</label>
          <Input name="terms" placeholder="e.g. $500 lease, 50/50 split" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Notes</label>
          <textarea
            name="notes"
            placeholder="What's the deal, what's next, follow-ups…"
            className="w-full h-20 rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1">Add to Pipeline</Button>
        </div>
      </form>
    </div>
  );
}