import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, FileSignature, CheckCircle2, AlertTriangle, Music2 } from "lucide-react";

/**
 * Public signing page — the artist opens this from the emailed link,
 * reviews the agreement, and e-signs by typing their name. No account needed.
 */
export default function SignContract() {
  const { token } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedName, setSignedName] = useState("");
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    base44.functions.invoke("producerContracts", { action: "get", token })
      .then((res) => {
        setContract(res.data?.contract);
        if (res.data?.contract?.status === "signed") setSigned(true);
      })
      .catch((e) => setError(e?.response?.data?.error || "This signing link is not valid."))
      .finally(() => setLoading(false));
  }, [token]);

  const sign = async () => {
    if (!signedName.trim() || signing) return;
    setSigning(true);
    setError("");
    try {
      const res = await base44.functions.invoke("producerContracts", {
        action: "sign",
        token,
        signed_name: signedName.trim(),
      });
      if (res.data?.success) setSigned(true);
    } catch (e) {
      setError(e?.response?.data?.error || "Couldn't sign — please try again.");
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <SoundReadyLogo size={26} />
          <span className="text-xs text-muted-foreground">Secure contract signing</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !contract ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-12 text-center space-y-3">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
            <p className="font-heading font-bold text-lg">{error || "Link not valid"}</p>
            <p className="text-sm text-muted-foreground">Ask the producer to resend the signing link.</p>
          </div>
        ) : signed ? (
          <div className="rounded-2xl bg-card border border-primary/20 p-12 text-center space-y-4">
            <CheckCircle2 className="h-14 w-14 text-primary mx-auto" />
            <p className="font-heading text-2xl font-bold">Signed. You're all set.</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {contract.producer_name} has been notified and a signed copy of the{" "}
              {contract.template_title.toLowerCase()} has been saved to their SoundReady account.{" "}
              {contract.beat_title ? `"${contract.beat_title}" is officially covered by the agreement.` : ""}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs text-primary uppercase tracking-widest font-bold">Agreement for your signature</p>
              <h1 className="font-heading text-3xl font-bold">{contract.template_title}</h1>
              <p className="text-muted-foreground text-sm">
                From <span className="text-foreground font-semibold">{contract.producer_name}</span>
                {contract.sent_at && <> · sent {new Date(contract.sent_at).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</>}
              </p>
            </div>

            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "You (the Artist)", value: contract.artist_name },
                  { label: "Beat", value: contract.beat_title || "—" },
                  { label: "Deal type", value: contract.deal_type || "—" },
                  { label: "Fee", value: contract.fee != null ? `$${contract.fee} USD` : "—" },
                ].map((f) => (
                  <div key={f.label} className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold">{f.label}</p>
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      {f.label === "Beat" && f.value !== "—" && <Music2 className="h-3.5 w-3.5 text-primary" />}
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold mb-2">Terms</p>
                <div className="text-xs leading-relaxed text-foreground whitespace-pre-wrap max-h-72 overflow-y-auto rounded-lg bg-secondary/50 border border-border p-4">
                  {contract.terms || "No terms were attached to this agreement."}
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm px-4 py-3">
                {error}
              </div>
            )}

            <div className="rounded-2xl bg-card border border-primary/20 p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Type your full legal name to sign</label>
                <Input
                  value={signedName}
                  onChange={(e) => setSignedName(e.target.value)}
                  placeholder="Your full name"
                  className="h-11 text-base"
                  onKeyDown={(e) => e.key === "Enter" && sign()}
                />
              </div>
              <Button className="w-full h-11 gap-2 font-semibold" onClick={sign} disabled={!signedName.trim() || signing}>
                {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
                {signing ? "Signing…" : "Sign This Agreement"}
              </Button>
              <p className="text-[10px] text-muted-foreground/70 text-center leading-relaxed">
                By typing your name and signing, you agree to the terms above. Your typed name, the date, and the time
                are recorded as your electronic signature.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}