import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Copy, Check, Scale, Music2, Mic2, Users, Receipt, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";

const TEMPLATES = [
  {
    id: "song_splits",
    icon: Music2,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "Song Split Agreement",
    description: "Define ownership percentages between songwriters, producers, and co-writers for master and publishing rights.",
    fields: [
      { key: "song_title", label: "Song Title", placeholder: "e.g. Midnight Run" },
      { key: "artist_name", label: "Artist / Band Name", placeholder: "e.g. Maya Lane" },
      { key: "recording_date", label: "Recording Date", placeholder: "e.g. April 15, 2026" },
      { key: "contributor_1_name", label: "Contributor 1 Name", placeholder: "e.g. John Smith" },
      { key: "contributor_1_role", label: "Contributor 1 Role", placeholder: "e.g. Lead Songwriter" },
      { key: "contributor_1_split", label: "Contributor 1 Split %", placeholder: "e.g. 50" },
      { key: "contributor_2_name", label: "Contributor 2 Name", placeholder: "e.g. Jane Doe" },
      { key: "contributor_2_role", label: "Contributor 2 Role", placeholder: "e.g. Producer" },
      { key: "contributor_2_split", label: "Contributor 2 Split %", placeholder: "e.g. 50" },
      { key: "pro_name", label: "PRO (ASCAP / BMI / SESAC)", placeholder: "e.g. ASCAP" },
    ],
    generate: (f) => `SONG SPLIT AGREEMENT

This Song Split Agreement ("Agreement") is entered into as of ${f.recording_date || "[DATE]"} by and between the following parties (collectively, the "Contributors"):

SONG INFORMATION
Song Title: ${f.song_title || "[SONG TITLE]"}
Artist / Band: ${f.artist_name || "[ARTIST NAME]"}
Recording Date: ${f.recording_date || "[DATE]"}

OWNERSHIP SPLITS

Contributor 1:
  Name: ${f.contributor_1_name || "[NAME]"}
  Role: ${f.contributor_1_role || "[ROLE]"}
  Ownership Share: ${f.contributor_1_split || "[X]"}%

Contributor 2:
  Name: ${f.contributor_2_name || "[NAME]"}
  Role: ${f.contributor_2_role || "[ROLE]"}
  Ownership Share: ${f.contributor_2_split || "[X]"}%

Total: 100%

TERMS & CONDITIONS

1. PUBLISHING RIGHTS. The above splits apply to both the master recording and the underlying composition (publishing), unless otherwise specified in a separate agreement.

2. PRO REGISTRATION. Each contributor is responsible for registering their share with their respective Performing Rights Organization (PRO). Designated PRO: ${f.pro_name || "[PRO NAME]"}.

3. ROYALTY COLLECTION. All royalties, including mechanical, performance, sync, and digital royalties, shall be divided in accordance with the ownership percentages above.

4. CREDIT. Each contributor shall receive appropriate credit on all commercial releases, streaming platforms, and promotional materials.

5. MODIFICATIONS. This Agreement may only be amended by a written document signed by all Contributors.

6. GOVERNING LAW. This Agreement shall be governed by the laws of the State of [STATE].

7. ENTIRE AGREEMENT. This Agreement constitutes the entire agreement between the parties with respect to the subject matter herein.

SIGNATURES

By signing below, each party acknowledges they have read, understood, and agreed to the terms of this Agreement.

Contributor 1: ___________________________ Date: ___________
  ${f.contributor_1_name || "[NAME]"}

Contributor 2: ___________________________ Date: ___________
  ${f.contributor_2_name || "[NAME]"}
`,
  },
  {
    id: "copyright",
    icon: Scale,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    title: "Copyright Assignment Agreement",
    description: "Transfer or license copyright ownership of a musical composition or master recording from one party to another.",
    fields: [
      { key: "song_title", label: "Song Title", placeholder: "e.g. Midnight Run" },
      { key: "assignor_name", label: "Assignor Name (Current Owner)", placeholder: "e.g. John Smith" },
      { key: "assignee_name", label: "Assignee Name (Receiving Ownership)", placeholder: "e.g. Indie Label LLC" },
      { key: "assignment_type", label: "Assignment Type", placeholder: "e.g. Full Assignment / Exclusive License" },
      { key: "territory", label: "Territory", placeholder: "e.g. Worldwide" },
      { key: "effective_date", label: "Effective Date", placeholder: "e.g. April 15, 2026" },
      { key: "consideration", label: "Consideration (Payment)", placeholder: "e.g. $500 USD / Royalty Share" },
    ],
    generate: (f) => `COPYRIGHT ASSIGNMENT AGREEMENT

This Copyright Assignment Agreement ("Agreement") is entered into as of ${f.effective_date || "[DATE]"} between:

ASSIGNOR (Current Copyright Owner):
  Name: ${f.assignor_name || "[ASSIGNOR NAME]"}

ASSIGNEE (Receiving Party):
  Name: ${f.assignee_name || "[ASSIGNEE NAME]"}

WORK COVERED
  Song Title: ${f.song_title || "[SONG TITLE]"}
  Type of Assignment: ${f.assignment_type || "[FULL ASSIGNMENT / EXCLUSIVE LICENSE]"}
  Territory: ${f.territory || "Worldwide"}
  Effective Date: ${f.effective_date || "[DATE]"}

TERMS & CONDITIONS

1. ASSIGNMENT. For good and valuable consideration of ${f.consideration || "[CONSIDERATION]"}, the receipt and sufficiency of which is hereby acknowledged, Assignor hereby irrevocably assigns, transfers, and conveys to Assignee all right, title, and interest in and to the copyright in the Work identified above, including all renewal and extension rights.

2. SCOPE. This assignment includes, but is not limited to: the right to reproduce, distribute, publicly perform, publicly display, create derivative works, and sublicense the Work.

3. WARRANTIES. Assignor warrants that: (a) Assignor is the sole owner of the copyright in the Work; (b) the Work does not infringe upon any third-party rights; (c) Assignor has full authority to enter into this Agreement.

4. MORAL RIGHTS. To the extent permitted by applicable law, Assignor hereby waives all moral rights in the Work.

5. FURTHER ASSURANCES. Assignor agrees to execute any additional documents necessary to complete the transfer of copyright as contemplated herein.

6. GOVERNING LAW. This Agreement shall be governed by the laws of the State of [STATE].

SIGNATURES

Assignor: ___________________________ Date: ___________
  ${f.assignor_name || "[ASSIGNOR NAME]"}

Assignee: ___________________________ Date: ___________
  ${f.assignee_name || "[ASSIGNEE NAME]"}
`,
  },
  {
    id: "producer",
    icon: Mic2,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    title: "Producer Agreement",
    description: "Define the relationship between an artist and producer — including beat licensing, royalty splits, credits, and deliverables.",
    fields: [
      { key: "song_title", label: "Song / Project Title", placeholder: "e.g. Midnight Run" },
      { key: "artist_name", label: "Artist Name", placeholder: "e.g. Maya Lane" },
      { key: "producer_name", label: "Producer Name", placeholder: "e.g. DJ Beats" },
      { key: "producer_split", label: "Producer Royalty Split %", placeholder: "e.g. 20" },
      { key: "artist_split", label: "Artist Royalty Split %", placeholder: "e.g. 80" },
      { key: "upfront_fee", label: "Upfront Producer Fee", placeholder: "e.g. $500 / $0" },
      { key: "deliverable_date", label: "Beat / Stems Delivery Date", placeholder: "e.g. April 20, 2026" },
      { key: "exclusive", label: "Exclusive or Non-Exclusive Beat", placeholder: "e.g. Exclusive" },
      { key: "effective_date", label: "Effective Date", placeholder: "e.g. April 15, 2026" },
    ],
    generate: (f) => `PRODUCER AGREEMENT

This Producer Agreement ("Agreement") is entered into as of ${f.effective_date || "[DATE]"} between:

ARTIST:
  Name: ${f.artist_name || "[ARTIST NAME]"}

PRODUCER:
  Name: ${f.producer_name || "[PRODUCER NAME]"}

PROJECT DETAILS
  Song / Project: ${f.song_title || "[SONG TITLE]"}
  Beat License Type: ${f.exclusive || "[EXCLUSIVE / NON-EXCLUSIVE]"}
  Upfront Producer Fee: ${f.upfront_fee || "[AMOUNT]"}
  Deliverable Date: ${f.deliverable_date || "[DATE]"}

ROYALTY SPLITS
  Artist: ${f.artist_split || "[X]"}%
  Producer: ${f.producer_split || "[X]"}%
  Total: 100%

TERMS & CONDITIONS

1. SERVICES. Producer agrees to deliver a fully produced instrumental beat and all associated stems (drums, bass, melody, etc.) by ${f.deliverable_date || "[DATE]"} in WAV format at 24-bit/48kHz minimum.

2. LICENSE. Producer grants Artist a ${f.exclusive || "[exclusive/non-exclusive]"} license to use the Beat for the recording and commercial release of "${f.song_title || "[SONG TITLE]"}." This includes streaming, download, radio play, sync, and live performance.

3. COMPENSATION. In consideration for Producer's services, Artist agrees to: (a) pay an upfront fee of ${f.upfront_fee || "[AMOUNT]"} upon execution of this Agreement; and (b) pay Producer ${f.producer_split || "[X]"}% of net master royalties generated from the recording.

4. PUBLISHING. Producer shall be entitled to ${f.producer_split || "[X]"}% of the publishing/composition share of the Work.

5. CREDIT. Producer shall receive written credit on all commercial releases as: "Produced by ${f.producer_name || "[PRODUCER NAME]"}."

6. OWNERSHIP. The master recording shall be jointly owned in accordance with the royalty splits above, unless otherwise agreed. The underlying composition shall be split as above.

7. WARRANTIES. Each party warrants they have full authority to enter this Agreement and that their contributions do not infringe third-party rights.

8. GOVERNING LAW. This Agreement shall be governed by the laws of the State of [STATE].

SIGNATURES

Artist: ___________________________ Date: ___________
  ${f.artist_name || "[ARTIST NAME]"}

Producer: ___________________________ Date: ___________
  ${f.producer_name || "[PRODUCER NAME]"}
`,
  },
  {
    id: "collab",
    icon: Users,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    title: "Collaboration Agreement",
    description: "A general-purpose agreement between two or more artists collaborating on a joint project, defining creative contributions and revenue sharing.",
    fields: [
      { key: "project_title", label: "Project / Song Title", placeholder: "e.g. Summer Sessions EP" },
      { key: "party_1_name", label: "Party 1 Name", placeholder: "e.g. Maya Lane" },
      { key: "party_1_role", label: "Party 1 Role", placeholder: "e.g. Lead Artist / Vocalist" },
      { key: "party_2_name", label: "Party 2 Name", placeholder: "e.g. Alex Rowe" },
      { key: "party_2_role", label: "Party 2 Role", placeholder: "e.g. Featured Artist" },
      { key: "revenue_split", label: "Revenue Split", placeholder: "e.g. 60/40 or 50/50" },
      { key: "release_platform", label: "Release Platform", placeholder: "e.g. Spotify, Apple Music, all DSPs" },
      { key: "effective_date", label: "Effective Date", placeholder: "e.g. April 15, 2026" },
    ],
    generate: (f) => `COLLABORATION AGREEMENT

This Collaboration Agreement ("Agreement") is entered into as of ${f.effective_date || "[DATE]"} between:

Party 1:
  Name: ${f.party_1_name || "[PARTY 1]"}
  Role: ${f.party_1_role || "[ROLE]"}

Party 2:
  Name: ${f.party_2_name || "[PARTY 2]"}
  Role: ${f.party_2_role || "[ROLE]"}

PROJECT DETAILS
  Project / Song Title: ${f.project_title || "[PROJECT TITLE]"}
  Release Platform(s): ${f.release_platform || "[PLATFORMS]"}
  Revenue Split: ${f.revenue_split || "[SPLIT]"}
  Effective Date: ${f.effective_date || "[DATE]"}

TERMS & CONDITIONS

1. COLLABORATIVE WORK. The parties agree to collaborate on the creation of "${f.project_title || "[PROJECT]"}" (the "Work"). Each party shall contribute their respective creative services as outlined above.

2. OWNERSHIP. The parties shall jointly own the Work in accordance with their revenue split (${f.revenue_split || "[SPLIT]"}), unless otherwise specified.

3. REVENUE SHARING. All net revenue generated from the Work — including streaming royalties, sync fees, master royalties, and live performance royalties — shall be split ${f.revenue_split || "[SPLIT]"} between Party 1 and Party 2.

4. CREDIT. Both parties shall receive credit on all commercial releases and promotional materials.

5. DECISION MAKING. Major decisions regarding the Work (including licensing, remixing, and commercial use) require mutual written consent from all parties.

6. TERMINATION. This Agreement may only be terminated by mutual written consent of all parties.

7. DISPUTE RESOLUTION. Any disputes arising under this Agreement shall first be subject to good-faith negotiation between the parties for a period of 30 days before any legal action is initiated.

8. GOVERNING LAW. This Agreement shall be governed by the laws of the State of [STATE].

SIGNATURES

Party 1: ___________________________ Date: ___________
  ${f.party_1_name || "[PARTY 1 NAME]"}

Party 2: ___________________________ Date: ___________
  ${f.party_2_name || "[PARTY 2 NAME]"}
`,
  },
];

function generatePDF(template, fields) {
  const doc = new jsPDF();
  const content = template.generate(fields);
  const lines = content.split("\n");
  const pageHeight = doc.internal.pageSize.height;
  let y = 20;
  const margin = 20;
  const lineHeight = 6;

  doc.setFont("helvetica");

  lines.forEach((line) => {
    if (y + lineHeight > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    const isHeading = line === line.toUpperCase() && line.trim().length > 0 && !line.startsWith(" ") && !line.match(/^[\d]/);
    if (isHeading && line.trim().length > 3) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });

  doc.save(`${template.id}_agreement.pdf`);
}

function generateInvoicePDF(inv, items) {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("INVOICE", margin, y);
  y += 10;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(`Invoice #: ${inv.invoice_number || "INV-001"}`, margin, y);
  doc.text(`Date: ${inv.invoice_date || ""}`, 140, y);
  y += 6;
  doc.text(`Due Date: ${inv.due_date || ""}`, 140, y);
  y += 12;

  // From / To
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("FROM:", margin, y);
  doc.text("BILL TO:", 110, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text(inv.from_name || "", margin, y);
  doc.text(inv.to_name || "", 110, y);
  y += 5;
  doc.text(inv.from_email || "", margin, y);
  doc.text(inv.to_email || "", 110, y);
  y += 5;
  if (inv.from_address) { doc.text(inv.from_address, margin, y); y += 5; }
  y += 8;

  // Table header
  doc.setFillColor(30, 30, 30);
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.rect(margin, y, 170, 8, "F");
  doc.text("Description", margin + 3, y + 5.5);
  doc.text("Qty", 120, y + 5.5);
  doc.text("Rate", 138, y + 5.5);
  doc.text("Amount", 158, y + 5.5);
  y += 8;

  // Items
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  items.forEach((item, i) => {
    const amount = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
    doc.setFillColor(i % 2 === 0 ? 245 : 255, i % 2 === 0 ? 245 : 255, i % 2 === 0 ? 245 : 255);
    doc.rect(margin, y, 170, 7, "F");
    doc.text(item.description || "", margin + 3, y + 5);
    doc.text(String(item.qty || ""), 120, y + 5);
    doc.text(`$${parseFloat(item.rate || 0).toFixed(2)}`, 138, y + 5);
    doc.text(`$${amount.toFixed(2)}`, 158, y + 5);
    y += 7;
  });

  // Totals
  const subtotal = items.reduce((s, item) => s + (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0), 0);
  const taxRate = parseFloat(inv.tax_rate) || 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Subtotal:`, 138, y); doc.text(`$${subtotal.toFixed(2)}`, 163, y); y += 6;
  if (taxRate > 0) { doc.text(`Tax (${taxRate}%):`, 138, y); doc.text(`$${tax.toFixed(2)}`, 163, y); y += 6; }
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL:`, 138, y); doc.text(`$${total.toFixed(2)}`, 163, y); y += 12;

  // Notes
  if (inv.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100);
    doc.text("Notes:", margin, y); y += 5;
    doc.text(inv.notes, margin, y);
  }

  doc.save(`invoice_${inv.invoice_number || "001"}.pdf`);
}

export default function Legal() {
  const [tab, setTab] = useState("contracts");
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [fields, setFields] = useState({});
  const [copied, setCopied] = useState(false);

  // Invoice state
  const [inv, setInv] = useState({
    invoice_number: "INV-001", invoice_date: "", due_date: "",
    from_name: "", from_email: "", from_address: "",
    to_name: "", to_email: "", tax_rate: "", notes: "",
  });
  const [items, setItems] = useState([{ description: "", qty: "1", rate: "" }]);

  const active = TEMPLATES.find((t) => t.id === activeTemplate);
  const preview = active ? active.generate(fields) : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addItem = () => setItems((i) => [...i, { description: "", qty: "1", rate: "" }]);
  const removeItem = (idx) => setItems((i) => i.filter((_, j) => j !== idx));
  const updateItem = (idx, key, val) => setItems((i) => i.map((item, j) => j === idx ? { ...item, [key]: val } : item));

  const subtotal = items.reduce((s, item) => s + (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0), 0);
  const taxAmt = subtotal * ((parseFloat(inv.tax_rate) || 0) / 100);
  const total = subtotal + taxAmt;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Legal</p>
          <h1 className="font-heading text-4xl font-bold">Legal & Finance</h1>
          <p className="text-muted-foreground">Contracts, agreements, and invoices for music industry professionals.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {[
            { id: "contracts", label: "Contract Templates", icon: FileText },
            { id: "invoice", label: "Invoice Generator", icon: Receipt },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setActiveTemplate(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* CONTRACTS TAB */}
        {tab === "contracts" && (
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

        {/* INVOICE TAB */}
        {tab === "invoice" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                {/* Invoice meta */}
                <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
                  <p className="font-heading font-semibold">Invoice Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground font-medium">Invoice #</label>
                      <Input value={inv.invoice_number} onChange={(e) => setInv((v) => ({ ...v, invoice_number: e.target.value }))} placeholder="INV-001" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground font-medium">Tax Rate %</label>
                      <Input value={inv.tax_rate} onChange={(e) => setInv((v) => ({ ...v, tax_rate: e.target.value }))} placeholder="e.g. 0 or 8.5" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground font-medium">Invoice Date</label>
                      <Input type="date" value={inv.invoice_date} onChange={(e) => setInv((v) => ({ ...v, invoice_date: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground font-medium">Due Date</label>
                      <Input type="date" value={inv.due_date} onChange={(e) => setInv((v) => ({ ...v, due_date: e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* From / To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From (You)</p>
                    <Input placeholder="Your Name / Artist Name" value={inv.from_name} onChange={(e) => setInv((v) => ({ ...v, from_name: e.target.value }))} />
                    <Input placeholder="Your Email" value={inv.from_email} onChange={(e) => setInv((v) => ({ ...v, from_email: e.target.value }))} />
                    <Input placeholder="Your Address (optional)" value={inv.from_address} onChange={(e) => setInv((v) => ({ ...v, from_address: e.target.value }))} />
                  </div>
                  <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bill To</p>
                    <Input placeholder="Client Name / Company" value={inv.to_name} onChange={(e) => setInv((v) => ({ ...v, to_name: e.target.value }))} />
                    <Input placeholder="Client Email" value={inv.to_email} onChange={(e) => setInv((v) => ({ ...v, to_email: e.target.value }))} />
                  </div>
                </div>

                {/* Line items */}
                <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                  <p className="font-heading font-semibold">Line Items</p>
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input className="flex-1" placeholder="Description (e.g. Beat Production)" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} />
                        <Input className="w-14" placeholder="Qty" value={item.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} />
                        <Input className="w-24" placeholder="Rate $" value={item.rate} onChange={(e) => updateItem(idx, "rate", e.target.value)} />
                        <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={addItem} className="gap-2 w-full">
                    <Plus className="h-3.5 w-3.5" /> Add Line Item
                  </Button>
                </div>

                {/* Notes */}
                <div className="rounded-2xl bg-card border border-border p-4 space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Notes / Payment Instructions</label>
                  <Input placeholder="e.g. Payment due via Venmo @artistname within 30 days" value={inv.notes} onChange={(e) => setInv((v) => ({ ...v, notes: e.target.value }))} />
                </div>

                <Button onClick={() => generateInvoicePDF(inv, items)} className="w-full gap-2">
                  <Download className="h-4 w-4" /> Download Invoice PDF
                </Button>
              </div>

              {/* Live preview */}
              <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
                <p className="font-heading font-semibold text-sm">Preview</p>
                <div className="space-y-3 text-sm font-mono">
                  <div className="flex justify-between text-xs text-muted-foreground border-b border-border pb-3">
                    <span>Invoice #{inv.invoice_number || "INV-001"}</span>
                    <span>{inv.invoice_date || "—"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs pb-3 border-b border-border">
                    <div><p className="text-muted-foreground mb-1">FROM</p><p className="font-semibold">{inv.from_name || "—"}</p><p className="text-muted-foreground">{inv.from_email}</p></div>
                    <div><p className="text-muted-foreground mb-1">BILL TO</p><p className="font-semibold">{inv.to_name || "—"}</p><p className="text-muted-foreground">{inv.to_email}</p></div>
                  </div>
                  <table className="w-full text-xs">
                    <thead><tr className="text-muted-foreground border-b border-border"><th className="text-left pb-1">Description</th><th className="text-right pb-1">Qty</th><th className="text-right pb-1">Rate</th><th className="text-right pb-1">Amount</th></tr></thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-1.5">{item.description || "—"}</td>
                          <td className="text-right">{item.qty}</td>
                          <td className="text-right">${parseFloat(item.rate || 0).toFixed(2)}</td>
                          <td className="text-right">${((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-xs space-y-1 text-right pt-1">
                    <div className="flex justify-end gap-8 text-muted-foreground"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    {parseFloat(inv.tax_rate) > 0 && <div className="flex justify-end gap-8 text-muted-foreground"><span>Tax ({inv.tax_rate}%)</span><span>${taxAmt.toFixed(2)}</span></div>}
                    <div className="flex justify-end gap-8 font-bold text-primary text-sm"><span>Total</span><span>${total.toFixed(2)}</span></div>
                  </div>
                  {inv.notes && <p className="text-xs text-muted-foreground pt-2 border-t border-border">{inv.notes}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}