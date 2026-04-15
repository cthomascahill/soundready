import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Receipt, Download, Plus, Trash2, ListChecks, Clock, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import jsPDF from "jspdf";

const STATUS_CONFIG = {
  sent:    { label: "Sent",    color: "text-chart-5",        bg: "bg-chart-5/10",        icon: Clock },
  paid:    { label: "Paid",    color: "text-primary",        bg: "bg-primary/10",        icon: CheckCircle2 },
  overdue: { label: "Overdue", color: "text-destructive",    bg: "bg-destructive/10",    icon: AlertCircle },
  draft:   { label: "Draft",   color: "text-muted-foreground", bg: "bg-secondary",       icon: FileText },
};

function generateInvoicePDF(inv, items) {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

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

  if (inv.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100);
    doc.text("Notes:", margin, y); y += 5;
    doc.text(inv.notes, margin, y);
  }

  doc.save(`invoice_${inv.invoice_number || "001"}.pdf`);
}

export default function InvoiceManager() {
  const [tab, setTab] = useState("generator");

  // Generator state
  const [inv, setInv] = useState({
    invoice_number: "INV-001", invoice_date: "", due_date: "",
    from_name: "", from_email: "", from_address: "",
    to_name: "", to_email: "", tax_rate: "", notes: "",
  });
  const [items, setItems] = useState([{ description: "", qty: "1", rate: "" }]);

  // Tracker state
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  useEffect(() => {
    if (tab === "tracker") loadInvoices();
  }, [tab]);

  const loadInvoices = async () => {
    setLoadingInvoices(true);
    const data = await base44.entities.Invoice.list("-created_date", 50).catch(() => []);
    setSavedInvoices(data);
    setLoadingInvoices(false);
  };

  const addItem = () => setItems((i) => [...i, { description: "", qty: "1", rate: "" }]);
  const removeItem = (idx) => setItems((i) => i.filter((_, j) => j !== idx));
  const updateItem = (idx, key, val) => setItems((i) => i.map((item, j) => j === idx ? { ...item, [key]: val } : item));

  const subtotal = items.reduce((s, item) => s + (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0), 0);
  const taxAmt = subtotal * ((parseFloat(inv.tax_rate) || 0) / 100);
  const total = subtotal + taxAmt;

  const handleDownload = async () => {
    generateInvoicePDF(inv, items);
    const sub = subtotal;
    const tax = sub * ((parseFloat(inv.tax_rate) || 0) / 100);
    await base44.entities.Invoice.create({
      ...inv, items, subtotal: sub, total: sub + tax, status: "sent",
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Finances</p>
          <h1 className="font-heading text-4xl font-bold">Invoice Manager</h1>
          <p className="text-muted-foreground">Create professional invoices and track payment status.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {[
            { id: "generator", label: "Invoice Generator", icon: Receipt },
            { id: "tracker", label: "My Invoices", icon: ListChecks },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* GENERATOR TAB */}
        {tab === "generator" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
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

                <div className="rounded-2xl bg-card border border-border p-4 space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Notes / Payment Instructions</label>
                  <Input placeholder="e.g. Payment due via Venmo @artistname within 30 days" value={inv.notes} onChange={(e) => setInv((v) => ({ ...v, notes: e.target.value }))} />
                </div>

                <Button onClick={handleDownload} className="w-full gap-2">
                  <Download className="h-4 w-4" /> Download & Save Invoice
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

        {/* TRACKER TAB */}
        {tab === "tracker" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["sent", "paid", "overdue", "draft"].map((s) => {
                const cfg = STATUS_CONFIG[s];
                const count = savedInvoices.filter((i) => i.status === s).length;
                const tot = savedInvoices.filter((i) => i.status === s).reduce((sum, i) => sum + (i.total || 0), 0);
                const Icon = cfg.icon;
                return (
                  <div key={s} className="rounded-2xl bg-card border border-border p-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${cfg.color}`} />
                      <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="font-heading text-xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">${tot.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            {loadingInvoices ? (
              <div className="flex justify-center py-16"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
            ) : savedInvoices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center space-y-2">
                <Receipt className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="font-heading font-semibold">No invoices yet</p>
                <p className="text-sm text-muted-foreground">Download an invoice to save it here automatically.</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="divide-y divide-border">
                  {savedInvoices.map((invoice) => {
                    const cfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.sent;
                    const StatusIcon = cfg.icon;
                    return (
                      <div key={invoice.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors">
                        <div className={`h-9 w-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                          <StatusIcon className={`h-4 w-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">#{invoice.invoice_number}</p>
                          <p className="text-xs text-muted-foreground truncate">{invoice.to_name} · {invoice.invoice_date || "No date"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-sm">${(invoice.total || 0).toFixed(2)}</p>
                          <p className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</p>
                        </div>
                        <select
                          value={invoice.status}
                          onChange={async (e) => {
                            await base44.entities.Invoice.update(invoice.id, { status: e.target.value });
                            setSavedInvoices((prev) => prev.map((i) => i.id === invoice.id ? { ...i, status: e.target.value } : i));
                          }}
                          className="h-8 rounded-lg border border-input bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="sent">Sent</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                          <option value="draft">Draft</option>
                        </select>
                        <button
                          onClick={async () => {
                            await base44.entities.Invoice.delete(invoice.id);
                            setSavedInvoices((prev) => prev.filter((i) => i.id !== invoice.id));
                          }}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}