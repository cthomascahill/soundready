import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Loader2, AlertTriangle, CheckCircle2, Shield, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

const RISK_CONFIG = {
  Low: { color: "text-green-600", bg: "bg-green-500/10", border: "border-green-500/20", badge: "bg-green-500" },
  Medium: { color: "text-yellow-600", bg: "bg-yellow-500/10", border: "border-yellow-500/20", badge: "bg-yellow-500" },
  High: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", badge: "bg-orange-500" },
  Dangerous: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", badge: "bg-destructive" },
};

function RedFlagCard({ flag }) {
  const [open, setOpen] = useState(false);
  const isRed = flag.riskLevel === "red";
  return (
    <div className={`rounded-xl border p-4 space-y-2 ${isRed ? "border-destructive/30 bg-destructive/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
      <button className="w-full flex items-start justify-between gap-3 text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-start gap-3">
          <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${isRed ? "text-destructive" : "text-yellow-500"}`} />
          <div>
            <p className="font-semibold text-sm">{flag.clauseTitle}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{flag.whatItSays}</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Why This Matters</p>
              <p className="text-sm">{flag.whyItMatters}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs font-semibold text-primary mb-1">What to Push For</p>
              <p className="text-sm">{flag.negotiationTip}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnalysisReport({ result }) {
  const risk = RISK_CONFIG[result.overallRiskLevel] || RISK_CONFIG.Medium;
  return (
    <div className="space-y-6">
      {/* Overall Risk */}
      <div className={`rounded-2xl border p-6 space-y-3 ${risk.border} ${risk.bg}`}>
        <div className="flex items-center gap-3">
          <Shield className={`h-6 w-6 ${risk.color}`} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overall Risk Level</p>
            <p className={`font-heading text-3xl font-black ${risk.color}`}>{result.overallRiskLevel}</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed">{result.bottomLine}</p>
      </div>

      {/* Red Flags */}
      {result.redFlags?.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading font-bold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Red Flags ({result.redFlags.length})
          </h3>
          {result.redFlags.map((flag, i) => <RedFlagCard key={i} flag={flag} />)}
        </div>
      )}

      {/* Missing Protections */}
      {result.missingProtections?.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
          <h3 className="font-heading font-bold flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-400" />
            Missing Protections
          </h3>
          <div className="space-y-2">
            {result.missingProtections.map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fair Clauses */}
      {result.fairClauses?.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
          <h3 className="font-heading font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Fair Clauses ({result.fairClauses.length})
          </h3>
          <div className="space-y-2">
            {result.fairClauses.map((clause, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">{clause.title}</p>
                  {clause.explanation && <p className="text-xs text-muted-foreground mt-0.5">{clause.explanation}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl bg-secondary/50 border border-border p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Disclaimer:</strong> This analysis is AI-generated and for informational purposes only. It is not legal advice. For important contracts, consult a qualified entertainment attorney.
        </p>
      </div>
    </div>
  );
}

export default function ContractAnalyzer() {
  const [contractText, setContractText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [pastAnalyses, setPastAnalyses] = useState([]);
  const [selectedPast, setSelectedPast] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = JSON.parse(localStorage.getItem("contract_analyses") || "[]");
    setPastAnalyses(saved);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const uploadRes = await base44.integrations.Core.UploadFile({ file });
    const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: uploadRes.file_url,
      json_schema: { type: "object", properties: { text: { type: "string" } } }
    });
    if (extracted.status === "success" && extracted.output?.text) {
      setContractText(extracted.output.text);
    }
    setUploading(false);
  };

  const analyze = async () => {
    if (!contractText.trim()) return;
    setAnalyzing(true);
    setResult(null);

    const res = await base44.integrations.Core.InvokeLLM({
      model: "claude_sonnet_4_6",
      prompt: `You are an experienced music industry entertainment lawyer with 20 years of experience protecting independent artists. You have just been handed a contract to review. Your job is to identify every clause that could harm the artist, explain it in plain English, flag the risk level, and suggest what they should push back on or negotiate. You are direct, specific, and on the artist's side. You do not use legal jargon without explaining it.

CONTRACT TEXT:
${contractText.slice(0, 12000)}

Provide a thorough analysis.`,
      response_json_schema: {
        type: "object",
        properties: {
          overallRiskLevel: { type: "string" },
          redFlags: {
            type: "array",
            items: {
              type: "object",
              properties: {
                clauseTitle: { type: "string" },
                whatItSays: { type: "string" },
                whyItMatters: { type: "string" },
                riskLevel: { type: "string" },
                negotiationTip: { type: "string" }
              }
            }
          },
          fairClauses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                explanation: { type: "string" }
              }
            }
          },
          missingProtections: { type: "array", items: { type: "string" } },
          bottomLine: { type: "string" }
        }
      }
    });

    setResult(res);

    // Save to localStorage
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      preview: contractText.slice(0, 100) + "...",
      result: res,
    };
    const updated = [entry, ...pastAnalyses].slice(0, 10);
    setPastAnalyses(updated);
    localStorage.setItem("contract_analyses", JSON.stringify(updated));
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Finances & Legal</p>
          <h1 className="font-heading text-4xl font-bold">Contract Analyzer</h1>
          <p className="text-muted-foreground">Upload or paste any music industry contract. Get a plain-English analysis of every clause that could hurt you.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <h2 className="font-heading font-semibold">Upload Contract</h2>

              <label className="block cursor-pointer">
                <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                <div className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors p-6 text-center hover:bg-primary/5">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">Upload PDF, TXT, or DOC</p>
                      <p className="text-xs text-muted-foreground mt-1">Or paste contract text below</p>
                    </>
                  )}
                </div>
              </label>

              <textarea
                value={contractText}
                onChange={e => setContractText(e.target.value)}
                placeholder="Or paste your contract text directly here..."
                className="w-full h-48 rounded-xl border border-input bg-card px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring font-mono"
              />

              <Button onClick={analyze} disabled={analyzing || !contractText.trim()} className="w-full gap-2 font-heading font-bold">
                {analyzing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Analyzing Contract...</>
                ) : (
                  <><Shield className="h-4 w-4" />Analyze Contract</>
                )}
              </Button>
            </div>
          </div>

          {/* Past Analyses */}
          {pastAnalyses.length > 0 && (
            <div className="rounded-2xl bg-card border border-border p-5 space-y-3 h-fit">
              <h2 className="font-heading font-semibold text-sm">Past Analyses</h2>
              <div className="space-y-2">
                {pastAnalyses.map((a) => {
                  const risk = RISK_CONFIG[a.result?.overallRiskLevel] || RISK_CONFIG.Medium;
                  return (
                    <button key={a.id} onClick={() => { setResult(a.result); setSelectedPast(a.id); }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors hover:border-primary/30 ${selectedPast === a.id ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${risk.badge}`}>{a.result?.overallRiskLevel}</span>
                        <span className="text-[10px] text-muted-foreground">{moment(a.date).format("MMM D")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{a.preview}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {analyzing && (
          <div className="rounded-2xl bg-card border border-border p-12 text-center space-y-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
            <p className="font-heading font-semibold">Reviewing contract...</p>
            <p className="text-sm text-muted-foreground">This takes 15–30 seconds. Reading every clause carefully.</p>
          </div>
        )}
        {result && !analyzing && <AnalysisReport result={result} />}
      </div>
    </div>
  );
}