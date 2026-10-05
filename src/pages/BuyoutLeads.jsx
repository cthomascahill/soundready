import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Building2, Search, Inbox, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import moment from "moment";

const fmt = (n) => "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

const STATUS_STYLES = {
  interested: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  contacted: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  closed: "bg-green-500/15 text-green-400 border-green-500/25",
};

export default function BuyoutLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => {
    base44.entities.CatalogBuyoutInterest.list("-created_date", 500)
      .then(setLeads)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await base44.entities.CatalogBuyoutInterest.update(id, { status });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = leads.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.creator_name?.toLowerCase().includes(q) ||
      l.creator_email?.toLowerCase().includes(q)
    );
  });

  const totalBuyout = filtered.reduce((sum, l) => sum + (l.estimated_buyout || 0), 0);

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-zinc-500">This area is for SoundReady Records admins only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">SoundReady Records</p>
            <h1 className="font-heading text-3xl font-bold">Buyout Leads</h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              Creators who clicked "I'm Interested" on the catalog buyout estimate
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Leads</p>
              <p className="font-heading text-2xl font-bold">{filtered.length}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Combined est. buyouts</p>
              <p className="font-heading text-2xl font-bold text-primary">{fmt(totalBuyout)}</p>
            </div>
          </div>
        </div>

        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input placeholder="Search by name or email..." value={search}
            onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-zinc-800" />
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 space-y-3">
            <Inbox className="h-12 w-12 text-zinc-700 mx-auto" />
            <p className="text-zinc-500">
              {search ? "No leads match your search." : "No buyout interest yet. Leads appear here when a creator clicks \"I'm Interested\"."}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-zinc-500 uppercase tracking-wider">
                    <th className="px-4 py-3 font-medium">Creator</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium text-right">Monthly Revenue</th>
                    <th className="px-4 py-3 font-medium text-right">Est. Buyout</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(lead => (
                    <tr key={lead.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                            <Building2 className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span className="font-medium truncate max-w-[180px]">{lead.creator_name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${lead.creator_email}`} className="text-primary hover:underline flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate max-w-[220px]">{lead.creator_email}</span>
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmt(lead.monthly_revenue)}<span className="text-zinc-600 text-xs">/mo</span></td>
                      <td className="px-4 py-3 text-right font-semibold text-primary tabular-nums">{fmt(lead.estimated_buyout)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          disabled={updatingId === lead.id}
                          onChange={e => updateStatus(lead.id, e.target.value)}
                          className={`h-7 rounded-full border px-2.5 text-xs font-medium focus:outline-none bg-transparent cursor-pointer disabled:opacity-50 ${STATUS_STYLES[lead.status] || STATUS_STYLES.interested}`}
                        >
                          <option value="interested">Interested</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{moment(lead.created_date).format("MMM D, YYYY")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}