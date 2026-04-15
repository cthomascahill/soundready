import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Copy, Check, Scale, Music2, Mic2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
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
          <h1 className="font-heading text-4xl font-bold">Legal Templates</h1>
          <p className="text-muted-foreground">Professional music industry contracts. Fill in your details, download as PDF, and get it signed.</p>
        </motion.div>

        {!activeTemplate ? (
          /* Template selection grid */
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
          /* Template editor */
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveTemplate(null)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Back
              </button>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-semibold">{active.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fields */}
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
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button variant="outline" onClick={handleCopy} className="gap-2">
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy Text"}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground px-1">
                  ⚠️ These templates are provided for informational purposes. For legally binding agreements, consult a licensed entertainment attorney.
                </p>
              </div>

              {/* Preview */}
              <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                <p className="font-heading font-semibold text-sm">Live Preview</p>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed overflow-auto max-h-[560px] font-mono">
                  {preview}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}