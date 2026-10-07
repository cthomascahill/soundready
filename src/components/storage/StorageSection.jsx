import { DollarSign, Newspaper, Send, FileText, ScanLine, Scale, StickyNote } from "lucide-react";
import StorageCard from "./StorageCard";

export const CATEGORY_META = {
  money: { label: "Money & Taxes", icon: DollarSign },
  press: { label: "Press Kit & EPK", icon: Newspaper },
  outreach: { label: "Outreach & Drafts", icon: Send },
  reports: { label: "Reports & Analyses", icon: FileText },
  scans: { label: "Reputation Scans", icon: ScanLine },
  legal: { label: "Contracts & Legal", icon: Scale },
  notes: { label: "Sam's Notes", icon: StickyNote },
};

export default function StorageSection({ category, docs }) {
  const meta = CATEGORY_META[category];
  if (!meta || !docs.length) return null;
  const Icon = meta.icon;
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="font-heading font-bold text-xs uppercase tracking-widest">{meta.label}</h2>
        <span className="text-[10px] text-muted-foreground/70">{docs.length}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map(d => <StorageCard key={d.id} doc={d} />)}
      </div>
    </section>
  );
}