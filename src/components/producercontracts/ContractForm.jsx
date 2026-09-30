import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CONTRACT_TEMPLATES } from "@/lib/contractTemplates";
import { Loader2, FileSignature } from "lucide-react";

/**
 * Modal: build a producer contract from a template, edit the terms,
 * and save it as a draft ready to send.
 */
export default function ContractForm({ open, onClose, onSaved, contract }) {
  const isEdit = !!contract;
  const [templateId, setTemplateId] = useState(contract?.template_type || "beat_lease");
  const [artistName, setArtistName] = useState(contract?.artist_name || "");
  const [artistEmail, setArtistEmail] = useState(contract?.artist_email || "");
  const [beatTitle, setBeatTitle] = useState(contract?.beat_title || "");
  const [dealType, setDealType] = useState(contract?.deal_type || "Lease");
  const [fee, setFee] = useState(contract?.fee ?? "");
  const [terms, setTerms] = useState(
    contract?.terms || CONTRACT_TEMPLATES.find((t) => t.id === (contract?.template_type || "beat_lease"))?.defaultTerms || ""
  );
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const pickTemplate = (id) => {
    setTemplateId(id);
    if (!isEdit) setTerms(CONTRACT_TEMPLATES.find((t) => t.id === id)?.defaultTerms || "");
  };

  const template = CONTRACT_TEMPLATES.find((t) => t.id === templateId) || CONTRACT_TEMPLATES[0];

  const save = async () => {
    if (!artistName || saving) return;
    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        saved = await base44.entities.ProducerContract.update(contract.id, {
          template_type: templateId,
          artist_name: artistName,
          artist_email: artistEmail || undefined,
          beat_title: beatTitle || undefined,
          deal_type: template.showDeal ? dealType : undefined,
          fee: fee !== "" && fee != null ? Number(fee) : undefined,
          terms,
        });
      } else {
        const res = await base44.functions.invoke("producerContracts", {
          action: "create",
          template_type: templateId,
          artist_name: artistName,
          artist_email: artistEmail,
          beat_title: beatTitle,
          deal_type: template.showDeal ? dealType : undefined,
          fee: fee,
          terms,
        });
        saved = res.data?.contract;
      }
      onSaved(saved, !isEdit);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 z-10">
        <p className="font-heading font-bold text-lg">{isEdit ? "Edit Contract" : "New Contract"}</p>

        {/* Template picker */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Template</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CONTRACT_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => pickTemplate(t.id)}
                className={`text-left p-3 rounded-xl border transition-colors ${
                  templateId === t.id
                    ? "bg-primary/10 border-primary/30"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <p className={`text-sm font-semibold ${templateId === t.id ? "text-primary" : ""}`}>{t.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Artist Name *</label>
            <Input value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="e.g. Matt Corman" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Artist Email</label>
            <Input type="email" value={artistEmail} onChange={(e) => setArtistEmail(e.target.value)} placeholder="Where the signing link goes" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Beat Title</label>
            <Input value={beatTitle} onChange={(e) => setBeatTitle(e.target.value)} placeholder="e.g. Midnight Drip" />
          </div>
          {template.showDeal && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Deal Type</label>
                <select
                  value={dealType}
                  onChange={(e) => setDealType(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option>Lease</option>
                  <option>Exclusive</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Fee ($)</label>
                <Input type="number" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="e.g. 300" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Terms (editable)</label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="w-full h-56 rounded-lg border border-input bg-transparent px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 gap-2" onClick={save} disabled={saving || !artistName}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Save Contract"}
          </Button>
        </div>
      </div>
    </div>
  );
}