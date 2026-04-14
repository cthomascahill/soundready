import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function ReportCard({ children, borderColor = "border-l-primary", className = "" }) {
  return (
    <div className={`rounded-2xl bg-card border border-border border-l-4 ${borderColor} p-6 space-y-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ icon: Icon, title, iconColor = "text-primary", badge }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <h3 className="font-heading font-bold text-lg leading-tight">{title}</h3>
      </div>
      {badge && <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground shrink-0">{badge}</span>}
    </div>
  );
}

export function CopyButton({ text, label = "Copy", className = "" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-secondary/50 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 ${className}`}>
      {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : label}
    </button>
  );
}