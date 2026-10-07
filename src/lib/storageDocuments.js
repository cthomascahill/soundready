// Normalizes every document Sam and the platform store for an artist into
// one shape, so the Storage page can organize them all by category.

export const STORAGE_CATEGORIES = [
  { id: "money", label: "Money & Taxes" },
  { id: "press", label: "Press Kit & EPK" },
  { id: "outreach", label: "Outreach & Drafts" },
  { id: "reports", label: "Reports & Analyses" },
  { id: "scans", label: "Reputation Scans" },
  { id: "legal", label: "Contracts & Legal" },
  { id: "notes", label: "Sam's Notes" },
];

export const CATEGORY_ORDER = STORAGE_CATEGORIES.map(c => c.id);

const MONEY_RE = /tax|income|revenue|earn|money|royalt|payout|budget|profit|gross|streaming report/i;

const clip = (text, n = 140) => (text || "").slice(0, n);

export function buildDocuments(data) {
  const docs = [];
  const push = (d) => { if (d?.title) docs.push(d); };

  // Sam's task results — money analyses (tax estimates, income averages)
  // file under Money, everything else under Reports
  (data.tasks || []).forEach(t => push({
    id: `task-${t.id}`,
    category: MONEY_RE.test(t.prompt || "") ? "money" : "reports",
    title: t.prompt,
    subtitle: clip(t.result?.summary) || (t.status === "working" ? "Sam is still working on this" : t.error || ""),
    status: t.status === "working" ? "In progress" : t.status === "failed" ? "Failed" : "Complete",
    date: t.created_date,
    link: `/tell-sam?task=${t.id}`,
    sourceLabel: "Tell Sam",
  }));

  (data.drafts || []).forEach(d => push({
    id: `draft-${d.id}`,
    category: "outreach",
    title: `${d.target_name || "Target"} — outreach draft`,
    subtitle: clip((d.draft || "").replace(/^Subject:.*\n/, "")),
    status: d.status,
    date: d.created_date,
    link: `/tell-sam?task=${d.task_id}`,
    sourceLabel: "Tell Sam",
  }));

  (data.deals || []).forEach(d => push({
    id: `deal-${d.id}`,
    category: "outreach",
    title: `${d.company_name} — ${(d.category || "deal").replace(/_/g, " ")}`,
    subtitle: clip(d.why_fit),
    status: d.status,
    date: d.created_date,
    link: "/deals",
    sourceLabel: "Deals",
  }));

  (data.recommendations || []).forEach(r => push({
    id: `rec-${r.id}`,
    category: "outreach",
    title: r.title,
    subtitle: clip(r.rationale) || clip(r.proposed_action),
    status: r.status,
    date: r.created_date,
    link: "/maya-desk",
    sourceLabel: "Sam's Desk",
  }));

  (data.activities || []).filter(a => a.title !== "__maya_suggestions__").forEach(a => {
    const category = a.action_type === "epk_generated" ? "press"
      : a.action_type === "digest_sent" ? "reports" : "outreach";
    push({
      id: `act-${a.id}`,
      category,
      title: a.title,
      subtitle: clip(a.description),
      status: a.status,
      date: a.created_date,
      link: "/maya-desk",
      sourceLabel: "Sam's Desk",
    });
  });

  (data.scans || []).forEach(s => push({
    id: `scan-${s.id}`,
    category: "scans",
    title: `Reputation scan — ${s.artist_name || "you"}`,
    subtitle: clip(s.scan_summary) || s.query,
    status: s.new_count ? `${s.new_count} new` : "",
    date: s.created_date,
    link: "/maya-desk",
    sourceLabel: "Sam's Desk",
  }));

  (data.memories || []).filter(m => m.status === "confirmed").forEach(m => push({
    id: `mem-${m.id}`,
    category: "notes",
    title: m.key,
    subtitle: m.value,
    date: m.created_date,
    link: "/maya-profile",
    sourceLabel: "Sam's Memory",
  }));

  (data.royalties || []).forEach(r => push({
    id: `roy-${r.id}`,
    category: "money",
    title: `${r.distributor} statement — ${r.period_label}`,
    subtitle: `$${Number(r.total_earnings || 0).toLocaleString()} total earnings · ${r.rows?.length || 0} line items`,
    date: r.created_date,
    link: "/royalties",
    sourceLabel: "Royalties",
  }));

  (data.invoices || []).forEach(inv => push({
    id: `inv-${inv.id}`,
    category: "money",
    title: `Invoice ${inv.invoice_number} — ${inv.to_name}`,
    subtitle: `$${Number(inv.total || 0).toLocaleString()}${inv.due_date ? ` · due ${inv.due_date}` : ""}`,
    status: inv.status,
    date: inv.created_date,
    link: "/invoices",
    sourceLabel: "Invoices",
  }));

  (data.venueContracts || []).forEach(c => push({
    id: `vc-${c.id}`,
    category: "legal",
    title: `${c.venue_name} — performance contract`,
    subtitle: `${c.performance_date || "Date TBD"}${c.payout_amount ? ` · $${c.payout_amount.toLocaleString()} (${c.payout_structure || "Flat Fee"})` : ""}`,
    status: c.status,
    date: c.created_date,
    link: "/contracts",
    sourceLabel: "Contracts",
  }));

  (data.producerContracts || []).forEach(c => push({
    id: `pc-${c.id}`,
    category: "legal",
    title: `${c.beat_title || "Agreement"} — ${c.artist_name}`,
    subtitle: (c.deal_type || (c.template_type || "agreement").replace(/_/g, " ")) + (c.fee ? ` · $${c.fee.toLocaleString()}` : ""),
    status: c.status,
    date: c.created_date,
    link: "/producer-contracts",
    sourceLabel: "Contracts",
  }));

  (data.epks || []).forEach(k => push({
    id: `epk-${k.id}`,
    category: "press",
    title: `Electronic Press Kit for ${k.artist_name || "you"}`,
    subtitle: clip(k.tagline || k.one_liner || k.bio),
    status: k.active === false ? "Replaced" : "Current",
    date: k.created_date,
    link: "/pitch-deck",
    sourceLabel: "EPK Builder",
  }));

  return docs.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}