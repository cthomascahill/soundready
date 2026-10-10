import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TEMPLATES } from "@/lib/contractTemplates";
import { generateContractPDF as generatePDF } from "@/lib/contractPdf";

export default function Legal() {
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [fields, setFields] = useState({});
  const [copied, setCopied] = useState(false);

  const active = TEMPLATES.find((t) => t.id === activeTemplate);
  const preview = active ? active.generate(fields) : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Legal</p>
          <h1 className="font-heading text-4xl font-bold">Contract Templates</h1>
          <p className="text-muted-foreground">Music industry agreements you can fill out and download as PDF.</p>
        </motion.div>

        {/* CONTRACTS */}
        {(
          !activeTemplate ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEMPLATES.map((t, i) => {
                const Icon = t.icon;
                return (
                  <motion.button
                    key={t.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => { setActiveTemplate(t.id); setFields({}); }}
                    className={`rounded-2xl bg-card border ${t.border} p-6 text-left space-y-4 hover:shadow-lg transition-all hover:scale-[1.01]`}
                  >
                    <div className={`h-11 w-11 rounded-xl ${t.bg} border ${t.border} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${t.color}`} />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-lg">{t.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t.description}</p>
                    </div>
                    <div className={`text-xs font-semibold flex items-center gap-1.5 ${t.color}`}>
                      <FileText className="h-3.5 w-3.5" />
                      Fill & Download PDF
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTemplate(null)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Back
                </button>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-semibold">{active.title}</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className={`rounded-2xl bg-card border ${active.border} p-5 space-y-4`}>
                    <p className="font-heading font-semibold">Fill in Your Details</p>
                    {active.fields.map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-xs text-muted-foreground font-medium">{field.label}</label>
                        <Input
                          placeholder={field.placeholder}
                          value={fields[field.key] || ""}
                          onChange={(e) => setFields((f) => ({ ...f, [field.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => generatePDF(active, fields)} className="flex-1 gap-2">
                      <Download className="h-4 w-4" /> Download PDF
                    </Button>
                    <Button variant="outline" onClick={handleCopy} className="gap-2">
                      {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy Text"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground px-1">⚠️ These templates are provided for informational purposes. Consult a licensed entertainment attorney for legally binding agreements.</p>
                </div>
                <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                  <p className="font-heading font-semibold text-sm">Live Preview</p>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed overflow-auto max-h-[560px] font-mono">{preview}</pre>
                </div>
              </div>
            </motion.div>
          )
        )}

      </div>
    </div>
  );
}