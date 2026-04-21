import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Upload, DollarSign, TrendingUp, Music, BarChart2, Trash2, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

const PLATFORM_COLORS = {
  "Spotify": "#1DB954", "Apple Music": "#FC3C44", "YouTube Music": "#FF0000",
  "Amazon Music": "#00A8E1", "Tidal": "#00FFFF", "Deezer": "#EF5466",
  "TikTok": "#010101", "Other": "#888888",
};

const DISTRIBUTOR_COLUMNS = {
  DistroKid: { song: ["Song/Album", "Title", "Song Title", "song/album", "title"], platform: ["Store", "Platform", "Service", "store"], streams: ["Streams", "Plays", "streams"], earnings: ["Earnings (USD)", "Amount", "Net Revenue", "Earnings", "earnings (usd)", "earnings"] },
  TuneCore: { song: ["Title", "Recording", "Song", "Track Title", "track title"], platform: ["Store", "Platform", "store"], streams: ["Streams", "Units", "streams"], earnings: ["Net Revenue", "Earnings", "Amount (USD)", "net revenue"] },
  "CD Baby": { song: ["Track Title", "Title", "Song", "track title"], platform: ["Store", "Platform", "store"], streams: ["Streams", "Downloads", "streams"], earnings: ["Net Revenue", "Royalties", "net revenue"] },
  Amuse: { song: ["Track", "Title", "Song", "Track Title"], platform: ["Platform", "Store", "Service"], streams: ["Streams", "Plays"], earnings: ["Revenue", "Earnings", "Net Revenue", "Amount"] },
  Other: { song: ["Title", "Song", "Track", "Song Title", "Track Title", "Recording", "song_title", "track_title"], platform: ["Platform", "Store", "Service", "platform", "store"], streams: ["Streams", "Plays", "Units", "streams", "plays"], earnings: ["Earnings", "Revenue", "Amount", "Net Revenue", "Royalties", "earnings", "revenue", "amount"] },
};

function parseCSVLine(line, delimiter) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

function parseCSV(text) {
  // Normalize line endings
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Auto-detect delimiter (tab vs comma)
  const firstLine = lines[0];
  const delimiter = (firstLine.split("\t").length > firstLine.split(",").length) ? "\t" : ",";

  const headers = parseCSVLine(lines[0], delimiter).map((h) => h.replace(/^["']|["']$/g, "").trim());
  
  return lines.slice(1).map((line) => {
    const vals = parseCSVLine(line, delimiter);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || "").replace(/^["']|["']$/g, "").trim(); });
    return obj;
  }).filter((row) => Object.values(row).some((v) => v !== ""));
}

function findColumn(row, options) {
  // Exact match first
  for (const opt of options) {
    if (row[opt] !== undefined && row[opt] !== "") return opt;
  }
  // Case-insensitive fallback
  const keys = Object.keys(row);
  for (const opt of options) {
    const found = keys.find((k) => k.toLowerCase() === opt.toLowerCase());
    if (found && row[found] !== undefined && row[found] !== "") return found;
  }
  // Partial match fallback
  for (const opt of options) {
    const found = keys.find((k) => k.toLowerCase().includes(opt.toLowerCase()) || opt.toLowerCase().includes(k.toLowerCase()));
    if (found && row[found] !== undefined && row[found] !== "") return found;
  }
  return null;
}

function processRows(rawRows, distributor) {
  const cols = DISTRIBUTOR_COLUMNS[distributor] || DISTRIBUTOR_COLUMNS.Other;
  return rawRows.map((row) => {
    const songCol = findColumn(row, cols.song);
    const platformCol = findColumn(row, cols.platform);
    const streamsCol = findColumn(row, cols.streams);
    const earningsCol = findColumn(row, cols.earnings);
    return {
      song_title: songCol ? row[songCol] : "Unknown",
      platform: platformCol ? row[platformCol] : "Other",
      streams: streamsCol ? parseFloat(row[streamsCol]) || 0 : 0,
      earnings: earningsCol ? parseFloat(row[earningsCol]) || 0 : 0,
      country: row["Country"] || row["Territory"] || "",
    };
  }).filter((r) => r.song_title && r.song_title !== "Unknown" || r.earnings > 0);
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-2">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-heading font-black">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(2)}`;
const fmtStreams = (n) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString();

export default function RoyaltyDashboard() {
  const [user, setUser] = useState(null);
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [distributor, setDistributor] = useState("DistroKid");
  const [periodLabel, setPeriodLabel] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const data = await base44.entities.RoyaltyStatement.filter({ created_by: u.email }, "-created_date", 50);
      setStatements(data);
    }).finally(() => setLoading(false));
  }, []);

  const handleFile = async (file) => {
    if (!file) return;
    setUploadError("");
    const label = periodLabel.trim() || file.name.replace(/\.[^/.]+$/, "");
    setUploading(true);
    const text = await file.text();
    const rawRows = parseCSV(text);

    if (rawRows.length === 0) {
      setUploadError("Could not read any rows from this file. Make sure it's a valid CSV or TSV export.");
      setUploading(false);
      return;
    }

    const rows = processRows(rawRows, distributor);

    if (rows.length === 0) {
      // Try Other as fallback
      const fallbackRows = processRows(rawRows, "Other");
      if (fallbackRows.length === 0) {
        const colNames = Object.keys(rawRows[0] || {}).join(", ");
        setUploadError(`No recognizable data found. Detected columns: ${colNames || "none"}. Try selecting "Other" as distributor.`);
        setUploading(false);
        return;
      }
      // Use fallback rows
      const total = fallbackRows.reduce((s, r) => s + r.earnings, 0);
      const record = await base44.entities.RoyaltyStatement.create({ distributor, period_label: label, total_earnings: total, rows: fallbackRows, raw_filename: file.name });
      setStatements((prev) => [record, ...prev]);
      setShowUpload(false);
      setPeriodLabel("");
      setUploading(false);
      return;
    }

    const total = rows.reduce((s, r) => s + r.earnings, 0);
    const record = await base44.entities.RoyaltyStatement.create({ distributor, period_label: label, total_earnings: total, rows, raw_filename: file.name });
    setStatements((prev) => [record, ...prev]);
    setShowUpload(false);
    setPeriodLabel("");
    setUploading(false);
  };

  const deleteStatement = async (id) => {
    await base44.entities.RoyaltyStatement.delete(id);
    setStatements((prev) => prev.filter((s) => s.id !== id));
  };

  // Aggregations
  const totalEarnings = statements.reduce((s, st) => s + (st.total_earnings || 0), 0);
  const totalStreams = statements.reduce((s, st) => s + (st.rows || []).reduce((a, r) => a + (r.streams || 0), 0), 0);

  // Earnings over time
  const earningsTimeline = [...statements].reverse().map((s) => ({ name: s.period_label, earnings: parseFloat(s.total_earnings?.toFixed(2) || 0) }));

  // Platform breakdown
  const platformMap = {};
  statements.forEach((st) => (st.rows || []).forEach((r) => {
    const p = r.platform || "Other";
    if (!platformMap[p]) platformMap[p] = { earnings: 0, streams: 0 };
    platformMap[p].earnings += r.earnings || 0;
    platformMap[p].streams += r.streams || 0;
  }));
  const platformData = Object.entries(platformMap).map(([name, d]) => ({ name, earnings: parseFloat(d.earnings.toFixed(2)), streams: d.streams })).sort((a, b) => b.earnings - a.earnings);

  // Per song
  const songMap = {};
  statements.forEach((st) => (st.rows || []).forEach((r) => {
    const k = r.song_title;
    if (!k) return;
    if (!songMap[k]) songMap[k] = { earnings: 0, streams: 0 };
    songMap[k].earnings += r.earnings || 0;
    songMap[k].streams += r.streams || 0;
  }));
  const songData = Object.entries(songMap).map(([name, d]) => ({ name, earnings: parseFloat(d.earnings.toFixed(2)), streams: d.streams })).sort((a, b) => b.earnings - a.earnings).slice(0, 15);

  const COLORS = Object.values(PLATFORM_COLORS);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Revenue Intelligence</p>
            <h1 className="font-heading text-4xl font-bold">Royalty Dashboard</h1>
            <p className="text-muted-foreground">Upload CSV royalty statements from your distributor and visualize earnings by platform and song.</p>
          </div>
          <Button onClick={() => { setShowUpload(true); setUploadError(""); }} className="gap-2"><Upload className="h-4 w-4" />Upload Statement</Button>
        </motion.div>

        {/* Upload modal */}
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowUpload(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4 z-10"
              onClick={(e) => e.stopPropagation()}>
              <p className="font-heading font-bold text-xl">Upload Royalty Statement</p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Distributor</label>
                  <select value={distributor} onChange={(e) => setDistributor(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                    {["DistroKid", "TuneCore", "CD Baby", "Amuse", "Other"].map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Period Label</label>
                  <input value={periodLabel} onChange={(e) => setPeriodLabel(e.target.value)} placeholder="e.g. Jan 2025, Q1 2025"
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div
                  className="rounded-xl border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => fileRef.current?.click()}>
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Click to select CSV file</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports DistroKid, TuneCore, CD Baby exports</p>
                </div>
                <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden"
                  onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
              </div>
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Processing CSV...
                </div>
              )}
              {uploadError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                  {uploadError}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => { setShowUpload(false); setUploadError(""); }}>Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : statements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center space-y-4">
            <DollarSign className="h-10 w-10 text-muted-foreground mx-auto" />
            <div><p className="font-semibold">No royalty statements yet</p><p className="text-muted-foreground text-sm">Upload a CSV from DistroKid, TuneCore, or CD Baby to get started</p></div>
            <Button onClick={() => setShowUpload(true)} className="gap-2"><Upload className="h-4 w-4" />Upload Your First Statement</Button>
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={DollarSign} label="Total Earnings" value={fmt(totalEarnings)} color="bg-primary/20 text-primary" />
              <StatCard icon={BarChart2} label="Total Streams" value={fmtStreams(totalStreams)} color="bg-chart-5/20 text-chart-5" />
              <StatCard icon={FileText} label="Statements" value={statements.length.toString()} color="bg-chart-4/20 text-chart-4" />
              <StatCard icon={Music} label="Songs Tracked" value={songData.length.toString()} color="bg-chart-3/20 text-chart-3" />
            </div>

            {/* Earnings over time */}
            {earningsTimeline.length > 1 && (
              <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
                <p className="font-heading font-semibold">Earnings Over Time</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={earningsTimeline}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, "Earnings"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Platform breakdown */}
              <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
                <p className="font-heading font-semibold">By Platform</p>
                {platformData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={platformData} dataKey="earnings" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                          {platformData.map((entry, i) => <Cell key={entry.name} fill={PLATFORM_COLORS[entry.name] || COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, "Earnings"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {platformData.slice(0, 6).map((p, i) => (
                        <div key={p.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PLATFORM_COLORS[p.name] || COLORS[i % COLORS.length] }} />
                            <span className="text-muted-foreground truncate max-w-[120px]">{p.name}</span>
                          </div>
                          <span className="font-medium">${p.earnings.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <p className="text-sm text-muted-foreground">No platform data in uploaded statements.</p>}
              </div>

              {/* Per song */}
              <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
                <p className="font-heading font-semibold">By Song</p>
                {songData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={songData.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v}`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={90} />
                      <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, "Earnings"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground">No song data in uploaded statements.</p>}
              </div>
            </div>

            {/* Statements list */}
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <p className="font-heading font-semibold">Uploaded Statements</p>
                <Button size="sm" variant="outline" onClick={() => setShowUpload(true)} className="gap-1"><Plus className="h-3.5 w-3.5" />Add</Button>
              </div>
              <div className="divide-y divide-border">
                {statements.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 px-5 py-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{s.period_label}</p>
                      <p className="text-xs text-muted-foreground">{s.distributor} · {s.rows?.length || 0} rows · {s.raw_filename}</p>
                    </div>
                    <p className="font-heading font-bold text-primary shrink-0">${s.total_earnings?.toFixed(2)}</p>
                    <button onClick={() => deleteStatement(s.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}