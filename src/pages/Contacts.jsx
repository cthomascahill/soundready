import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Mail, Trash2, Search, User, Tag, ExternalLink,
  Loader2, X, Send, ChevronDown, ChevronUp, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import moment from "moment";

const ROLES = ["Curator", "Playlist Manager", "Blogger", "A&R", "Music Supervisor", "Journalist", "Other"];
const PLATFORMS = ["Spotify", "Apple Music", "YouTube", "SoundCloud", "Blog", "Instagram", "TikTok", "Other"];
const STATUSES = ["Cold", "Pitched", "Responded", "Connected", "Pass"];

const STATUS_STYLES = {
  Cold: "bg-secondary text-muted-foreground",
  Pitched: "bg-primary/10 text-primary",
  Responded: "bg-yellow-500/10 text-yellow-400",
  Connected: "bg-accent/10 text-accent",
  Pass: "bg-destructive/10 text-destructive",
};

function ContactForm({ initial, songs, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    name: "", email: "", role: "Curator", platform: "", genres: [],
    relationship_status: "Cold", notes: "", website: ""
  });
  const [genreInput, setGenreInput] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addGenre = () => {
    const g = genreInput.trim();
    if (g && !form.genres?.includes(g)) set("genres", [...(form.genres || []), g]);
    setGenreInput("");
  };

  const removeGenre = (g) => set("genres", (form.genres || []).filter((x) => x !== g));

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="rounded-2xl bg-card border border-primary/30 p-6 space-y-4">
      <h3 className="font-heading font-semibold">{initial ? "Edit Contact" : "New Contact"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Name *</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Contact name" />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label>Role</Label>
          <select value={form.role} onChange={(e) => set("role", e.target.value)}
            className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Platform</Label>
          <select value={form.platform} onChange={(e) => set("platform", e.target.value)}
            className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Select platform</option>
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <select value={form.relationship_status} onChange={(e) => set("relationship_status", e.target.value)}
            className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Website</Label>
          <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
        </div>
      </div>
      {/* Genres */}
      <div className="space-y-1.5">
        <Label>Genres</Label>
        <div className="flex gap-2">
          <Input value={genreInput} onChange={(e) => setGenreInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGenre()} placeholder="Type genre and press Enter" />
          <Button variant="outline" size="icon" onClick={addGenre}><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {(form.genres || []).map((g) => (
            <span key={g} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-xs">
              {g}
              <button onClick={() => removeGenre(g)}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
          rows={2} placeholder="Any context, mutual connections, previous interactions..."
          className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving || !form.name} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Save
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function PitchModal({ contact, songs, onClose }) {
  const [selectedSongId, setSelectedSongId] = useState(songs[0]?.id || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const selectedSong = songs.find((s) => s.id === selectedSongId);

  const generateEmail = async () => {
    if (!selectedSong) return;
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a professional, personalized pitch email from an independent artist to a music ${contact.role}.

Contact: ${contact.name} (${contact.role}${contact.platform ? ` on ${contact.platform}` : ""})
Genres they cover: ${(contact.genres || []).join(", ") || "not specified"}

Track: "${selectedSong.title}" by ${selectedSong.artist_name}
Genre: ${selectedSong.genre} | Mood: ${selectedSong.mood} | Energy: ${selectedSong.energy_level}
SoundScore: ${selectedSong.overall_score}/100 | Spotify Score: ${selectedSong.spotify_score}/100
TikTok Score: ${selectedSong.tiktok_score}/100 | Hook Strength: ${selectedSong.hook_strength}/100
Similar Artists: ${(selectedSong.similar_artists || []).slice(0, 3).join(", ")}
Strengths: ${(selectedSong.strengths || []).slice(0, 2).join(". ")}

Write a concise, warm, non-spammy pitch. Lead with something specific. Keep it under 150 words. Include a clear ask.
Return subject line and body separately.`,
      response_json_schema: {
        type: "object",
        properties: {
          subject: { type: "string" },
          body: { type: "string" }
        }
      }
    });
    setSubject(result.subject);
    setBody(result.body);
    setGenerating(false);
  };

  const sendEmail = async () => {
    if (!contact.email || !body) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: contact.email,
      subject,
      body,
    });
    await base44.entities.Contact.update(contact.id, {
      relationship_status: "Pitched",
      last_pitched_date: new Date().toISOString(),
    });
    setSending(false);
    setSent(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-xl">Pitch Email to {contact.name}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>

        {sent ? (
          <div className="text-center py-10 space-y-3">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <Send className="h-8 w-8 text-accent" />
            </div>
            <p className="font-heading font-semibold text-lg">Email sent!</p>
            <p className="text-sm text-muted-foreground">Contact status updated to "Pitched".</p>
            <Button onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Track to Pitch</Label>
              <select value={selectedSongId} onChange={(e) => setSelectedSongId(e.target.value)}
                className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {songs.map((s) => <option key={s.id} value={s.id}>{s.title} — {s.artist_name}</option>)}
              </select>
            </div>

            <Button variant="outline" onClick={generateEmail} disabled={generating || !selectedSong} className="gap-2 w-full">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate AI Pitch Email
            </Button>

            {(subject || body) && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Body</Label>
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8}
                    className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <div className="flex gap-2">
                  {contact.email ? (
                    <Button onClick={sendEmail} disabled={sending} className="gap-2">
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send Email
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Add an email address to this contact to send directly.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [pitchContact, setPitchContact] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    Promise.all([
      base44.entities.Contact.list("-created_date", 200),
      base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 50),
    ]).then(([c, s]) => {
      setContacts(c);
      setSongs(s);
      setLoading(false);
    });
  }, []);

  const createContact = async (form) => {
    const c = await base44.entities.Contact.create(form);
    setContacts((prev) => [c, ...prev]);
    setShowForm(false);
  };

  const updateContact = async (form) => {
    const c = await base44.entities.Contact.update(editContact.id, form);
    setContacts((prev) => prev.map((x) => x.id === c.id ? c : x));
    setEditContact(null);
  };

  const deleteContact = async (id) => {
    await base44.entities.Contact.delete(id);
    setContacts((prev) => prev.filter((x) => x.id !== id));
  };

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || (c.genres || []).some((g) => g.toLowerCase().includes(q));
    const matchStatus = !filterStatus || c.relationship_status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {pitchContact && <PitchModal contact={pitchContact} songs={songs} onClose={() => setPitchContact(null)} />}

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-1">Outreach CRM</p>
        <h1 className="font-heading text-3xl font-bold">Curator Contacts</h1>
        <p className="text-muted-foreground mt-1">Manage your network of curators, playlist managers, and press contacts.</p>
      </motion.div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const count = contacts.filter((c) => c.relationship_status === s).length;
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterStatus === s ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30"}`}>
              {s} <span className="opacity-60 ml-1">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts..." className="pl-9" />
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />Add Contact
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <ContactForm onSave={createContact} onCancel={() => setShowForm(false)} />
          </motion.div>
        )}
        {editContact && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <ContactForm initial={editContact} onSave={updateContact} onCancel={() => setEditContact(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{contacts.length === 0 ? "No contacts yet. Add your first curator." : "No contacts match your filter."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((contact, i) => (
            <motion.div key={contact.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="group rounded-xl bg-card border border-border p-4 hover:border-primary/20 transition-all">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 font-heading font-bold text-primary">
                  {contact.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-semibold">{contact.name}</span>
                    <span className="text-xs text-muted-foreground">{contact.role}</span>
                    {contact.platform && <span className="text-xs text-muted-foreground">· {contact.platform}</span>}
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[contact.relationship_status] || STATUS_STYLES.Cold}`}>
                      {contact.relationship_status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(contact.genres || []).map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded-full bg-secondary text-xs">{g}</span>
                    ))}
                  </div>
                  {contact.last_pitched_date && (
                    <p className="text-xs text-muted-foreground mt-1">Last pitched {moment(contact.last_pitched_date).fromNow()}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {contact.website && (
                    <a href={contact.website} target="_blank" rel="noopener noreferrer"
                      className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8"
                    onClick={() => setPitchContact(contact)}>
                    <Mail className="h-4 w-4 text-primary" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8"
                    onClick={() => setEditContact(contact)}>
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8"
                    onClick={() => deleteContact(contact.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}