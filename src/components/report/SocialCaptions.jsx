import { useState } from "react";
import { MessageSquare, Copy, Check } from "lucide-react";
import ReportSection from "../ReportSection";

const CAPTION_LABELS = {
  instagram: { label: "Instagram", color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/20" },
  tiktok: { label: "TikTok", color: "text-chart-5", bg: "bg-chart-5/10", border: "border-chart-5/20" },
  twitter: { label: "Twitter / X", color: "text-chart-5", bg: "bg-chart-5/10", border: "border-chart-5/20" },
  wildcard_1: { label: "Wildcard", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  wildcard_2: { label: "Wildcard", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
};

function CaptionCard({ platform, text }) {
  const [copied, setCopied] = useState(false);
  const meta = CAPTION_LABELS[platform] || { label: platform, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl border ${meta.border} ${meta.bg} p-4 relative`}>
      <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${meta.color}`}>{meta.label}</p>
      <p className="text-sm text-foreground/90 leading-relaxed pr-8">{text}</p>
      <button
        onClick={copy}
        className="absolute top-3 right-3 h-7 w-7 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export default function SocialCaptions({ captions = {} }) {
  const keys = ["instagram", "tiktok", "twitter", "wildcard_1", "wildcard_2"];
  return (
    <ReportSection number={6} title="Social Media Captions" icon={MessageSquare} color="text-chart-3">
      <div className="space-y-3">
        {keys.map((k) => captions[k] ? <CaptionCard key={k} platform={k} text={captions[k]} /> : null)}
      </div>
    </ReportSection>
  );
}