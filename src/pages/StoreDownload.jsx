import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import { Button } from "@/components/ui/button";
import { Loader2, Download, CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * Post-checkout download page — verifies the Stripe session is paid and
 * hands the buyer a link to download the beat they just purchased.
 */
export default function StoreDownload() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      setError("This page needs a valid checkout session.");
      setLoading(false);
      return;
    }
    base44.functions.invoke("beatStoreCheckout", { action: "get_download", session_id: sessionId })
      .then((res) => setResult(res.data))
      .catch((e) => setError(e?.response?.data?.error || "We couldn't verify this order."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <SoundReadyLogo size={26} />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-12 text-center space-y-3 max-w-md">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
            <p className="font-heading font-bold text-lg">{error}</p>
            <p className="text-sm text-muted-foreground">
              If you just paid, refresh this page — it can take a few seconds for the payment to confirm.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-primary/20 p-10 text-center space-y-5 max-w-md w-full">
            <CheckCircle2 className="h-14 w-14 text-primary mx-auto" />
            <div className="space-y-1">
              <p className="font-heading text-2xl font-bold">Payment confirmed</p>
              <p className="text-sm text-muted-foreground">
                You bought "{result.beat_title}"{result.deal_type ? ` (${result.deal_type})` : ""} from{" "}
                {result.producer_name || "the producer"}.
              </p>
            </div>
            <a href={result.download_url} download>
              <Button size="lg" className="w-full gap-2 font-bold">
                <Download className="h-4 w-4" /> Download Your Beat
              </Button>
            </a>
            <p className="text-[10px] text-muted-foreground/70">
              This download link expires in about an hour — grab the file now. A copy of your receipt is in your email.
            </p>
            <Link to="/" className="block text-xs text-muted-foreground hover:text-foreground transition-colors pt-2">
              Powered by SoundReady — tools for artists & producers
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}