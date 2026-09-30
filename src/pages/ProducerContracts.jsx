import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import ContractForm from "@/components/producercontracts/ContractForm";
import { getTemplate } from "@/lib/contractTemplates";
import {
  Plus, FileSignature, Send, Download, Loader2, Pencil, FileText, CheckCircle2, Clock,
} from "lucide-react";

const STATUS_BADGES = {
  draft: { label: "Draft", cls: "bg-secondary text-muted-foreground border-border", icon: Pencil },
  sent: { label: "Awaiting Signature", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25", icon: Clock },
  signed: { label: "Signed", cls: "bg-primary/10 text-primary border-primary/20", icon: CheckCircle2 },
  declined: { label: "Declined", cls: "bg-red-500/10 text-red-400 border-red-500/20", icon: FileText },
};

/**
 * Producer Contracts — template agreements (beat lease, exclusive transfer,
 * collab split, NDA) that producers send for in-app e-signature.
 */
export default function ProducerContracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    if (!user?.id) return;
    base44.entities.ProducerContract.filter({ created_by_id: user.id }, "-created_date", 100)
      .then(setContracts)
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, [user]);

  const onSaved = (saved, isNew) => {
    setContracts((prev) => (isNew ? [saved, ...prev] : prev.map((c) => (c.id === saved.id ? saved : c))));
  };

  const sendContract = async (contract) => {
    if (!contract.artist_email) {
      setError(`Add ${contract.artist_name}'s email to this contract first.`);
      return;
    }
    setBusyId(contract.id);
    setError("");
    try {
      const res = await base44.functions.invoke("producerContracts", {
        action: "send",
        contract_id: contract.id,
        app_url: window.location.origin,
      });
      if (res.data?.contract) onSaved(res.data.contract, false);
    } catch (e) {
      setError(e?.response?.data?.error || "Couldn't send that contract.");
    } finally {
      setBusyId("");
    }
  };

  const downloadPdf = async (contract) => {
    if (!contract.pdf_file_uri) return;
    setBusyId(contract.id);
    try {
      const res = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: contract.pdf_file_uri, expires_in: 600 });
      window.open(res.signed_url, "_blank");
    } finally {
      setBusyId("");
    }
  };

  const deleteContract = async (contract) => {
    if (!window.confirm(`Delete the contract with ${contract.artist_name}?`)) return;
    await base44.entities.ProducerContract.delete(contract.id);
    setContracts((prev) => prev.filter((c) => c.id !== contract.id));
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Producer</p>
            <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
              <FileSignature className="h-6 w-6 text-primary" /> Contracts
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Template agreements for your artists — lease, exclusive rights, collab splits, NDAs. Send one and the
              artist signs right from a link. No account needed on their end.
            </p>
          </div>
          <Button
            className="gap-2 font-semibold"
            onClick={() => { setEditing(null); setModalOpen(true); }}
          >
            <Plus className="h-4 w-4" /> New Contract
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center space-y-3">
            <FileSignature className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="font-heading font-bold text-lg">No contracts yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Pick a template, fill in the artist and beat, and send it for signature. The signed PDF lands right back
              here.
            </p>
            <Button size="sm" className="gap-2 mx-auto" onClick={() => { setEditing(null); setModalOpen(true); }}>
              <Plus className="h-4 w-4" /> Create Your First Contract
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map((c, i) => {
              const badge = STATUS_BADGES[c.status] || STATUS_BADGES.draft;
              const template = getTemplate(c.template_type);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl bg-card border border-border p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 space-y-1">
                      <p className="font-heading font-bold text-base">{template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        With <span className="text-foreground font-semibold">{c.artist_name}</span>
                        {c.beat_title && <> · "{c.beat_title}"</>}
                        {c.fee != null && <> · ${c.fee}</>}
                        {c.deal_type && <> · {c.deal_type}</>}
                      </p>
                      {c.status === "signed" && c.signed_name && (
                        <p className="text-[11px] text-primary">
                          Signed by {c.signed_name} on{" "}
                          {new Date(c.signed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 inline-flex items-center gap-1 ${badge.cls}`}>
                      <badge.icon className="h-3 w-3" /> {badge.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {c.status === "draft" && (
                      <>
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setEditing(c); setModalOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button size="sm" className="gap-1.5" onClick={() => sendContract(c)} disabled={busyId === c.id}>
                          {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          Send for Signature
                        </Button>
                      </>
                    )}
                    {c.status === "sent" && (
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => sendContract(c)} disabled={busyId === c.id}>
                        {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        Resend Link
                      </Button>
                    )}
                    {c.status === "signed" && c.pdf_file_uri && (
                      <Button size="sm" className="gap-1.5" onClick={() => downloadPdf(c)} disabled={busyId === c.id}>
                        {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        Download Signed PDF
                      </Button>
                    )}
                    {c.status !== "signed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteContract(c)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <ContractForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={onSaved}
        contract={editing}
      />
    </div>
  );
}