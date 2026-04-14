import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MapPin, Mail, Phone, Globe, Star, Trash2, ChevronDown, ChevronUp, Search, Filter, Music, DollarSign, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

const STATUS_COLORS = {
  Prospect: "bg-secondary text-muted-foreground",
  Pitched: "bg-chart-5/15 text-chart-5",
  "Awaiting Response": "bg-yellow-500/15 text-yellow-400",
  Booked: "bg-primary/15 text-primary",
  Performed: "bg-teal-500/10 text-teal-400",
  Passed: "bg-red-500/10 text-red-400",
};

const STATUSES = ["Prospect", "Pitched", "Awaiting Response", "Booked", "Performed", "Passed"];
const VENUE_TYPES = ["Club", "Bar/Venue", "Concert Hall", "Arts Venue", "Amphitheater", "Festival", "Private Event Space", "Other"];
const GENRES = ["Hip Hop", "Pop", "R&B", "Country", "Rock", "EDM", "Latin", "Indie", "Other"];

const EMPTY_FORM = {
  name: "", city: "", state: "", country: "USA", capacity: "", venue_type: "",
  genres: [], booking_contact_name: "", booking_email: "", booking_phone: "",
  website: "", instagram: "", pay_range: "", door_deal: false,
  backline_provided: false, booking_requirements: "", submission_notes: "",
  status: "Prospect", last_contacted_date: "", performance_date: "",
  performance_notes: "", setlist: "", attendance: "", payout_received: "",
  rating: "", notes: "",
};

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star className={`h-4 w-4 ${n <= value ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

function VenueForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));
  const toggleGenre = (g) => setForm(f => ({ ...f, genres: f.genres?.includes(g) ? f.genres.filter(x => x !== g) : [...(f.genres || []), g] }));

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
      <p className="font-heading font-bold text-lg">{initial?.id ? "Edit Venue" : "Add New Venue"}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="col-span-2 sm:col-span-1 space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Venue Name *</label>
          <Input value={form.name} onChange={set("name")} placeholder="The Troubadour" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">City</label>
          <Input value={form.city} onChange={set("city")} placeholder="Los Angeles" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">State</label>
          <Input value={form.state} onChange={set("state")} placeholder="CA" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Capacity</label>
          <Input type="number" value={form.capacity} onChange={set("capacity")} placeholder="400" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Venue Type</label>
          <select value={form.venue_type} onChange={set("venue_type")} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">Select type</option>
            {VENUE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Status</label>
          <select value={form.status} onChange={set("status")} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Pay Range</label>
          <Input value={form.pay_range} onChange={set("pay_range")} placeholder="$200-$600" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Genres</label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map(g => (
            <button key={g} type="button" onClick={() => toggleGenre(g)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${form.genres?.includes(g) ? "bg-primary/15 border-primary/30 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Booking Contact</label>
          <Input value={form.booking_contact_name} onChange={set("booking_contact_name")} placeholder="Jane Smith" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Booking Email</label>
          <Input value={form.booking_email} onChange={set("booking_email")} placeholder="booking@venue.com" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Phone</label>
          <Input value={form.booking_phone} onChange={set("booking_phone")} placeholder="(555) 000-0000" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Website</label>
          <Input value={form.website} onChange={set("website")} placeholder="https://..." />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Instagram</label>
          <Input value={form.instagram} onChange={set("instagram")} placeholder="@venue" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Last Contacted</label>
          <Input type="date" value={form.last_contacted_date} onChange={set("last_contacted_date")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Booking Requirements</label>
        <textarea value={form.booking_requirements} onChange={set("booking_requirements")} rows={2}
          placeholder="EPK + 50K Spotify streams minimum, email with subject line..."
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Performance History</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Performance Date</label>
            <Input type="date" value={form.performance_date} onChange={set("performance_date")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Attendance</label>
            <Input type="number" value={form.attendance} onChange={set("attendance")} placeholder="150" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Payout Received ($)</label>
            <Input type="number" value={form.payout_received} onChange={set("payout_received")} placeholder="300" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Venue Rating</label>
          <StarRating value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Performance Notes</label>
          <textarea value={form.performance_notes} onChange={set("performance_notes")} rows={2}
            placeholder="How did the show go? Draw, crowd response, what to improve..."
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Setlist</label>
          <textarea value={form.setlist} onChange={set("setlist")} rows={2}
            placeholder="Song 1, Song 2, Song 3..."
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={() => onSave(form)} disabled={!form.name} className="gap-2"><Check className="h-4 w-4" />Save Venue</Button>
        <Button variant="ghost" onClick={onCancel}><X className="h-4 w-4" />Cancel</Button>
      </div>
    </div>
  );
}

function VenueCard({ venue, onEdit, onDelete, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const statusStyle = STATUS_COLORS[venue.status] || STATUS_COLORS.Prospect;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-heading font-bold">{venue.name}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}>{venue.status}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {(venue.city || venue.state) && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />{[venue.city, venue.state].filter(Boolean).join(", ")}
                </span>
              )}
              {venue.capacity && (
                <span className="text-xs text-muted-foreground">{venue.capacity} cap</span>
              )}
              {venue.pay_range && (
                <span className="flex items-center gap-1 text-xs text-primary font-medium">
                  <DollarSign className="h-3 w-3" />{venue.pay_range}
                </span>
              )}
              {venue.rating > 0 && (
                <span className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`h-3 w-3 ${n <= venue.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                  ))}
                </span>
              )}
            </div>
            {venue.genres?.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {venue.genres.map(g => (
                  <span key={g} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-muted-foreground">{g}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setExpanded(v => !v)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onEdit(venue)}>
              <Music className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => onDelete(venue.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {venue.booking_contact_name && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Booking Contact</p>
                <p className="text-sm font-medium">{venue.booking_contact_name}</p>
                {venue.booking_email && (
                  <a href={`mailto:${venue.booking_email}`} className="flex items-center gap-1 text-xs text-primary mt-0.5">
                    <Mail className="h-3 w-3" />{venue.booking_email}
                  </a>
                )}
                {venue.booking_phone && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Phone className="h-3 w-3" />{venue.booking_phone}
                  </p>
                )}
              </div>
            )}
            {venue.website && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Links</p>
                <a href={venue.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary">
                  <Globe className="h-3 w-3" />Website
                </a>
              </div>
            )}
          </div>
          {venue.booking_requirements && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Booking Requirements</p>
              <p className="text-sm text-foreground/85 leading-relaxed">{venue.booking_requirements}</p>
            </div>
          )}
          {venue.performance_notes && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Performance Notes</p>
              <p className="text-sm text-foreground/85 leading-relaxed">{venue.performance_notes}</p>
              {venue.attendance && <p className="text-xs text-muted-foreground mt-1">Attendance: {venue.attendance} · Payout: ${venue.payout_received || 0}</p>}
            </div>
          )}
          {venue.setlist && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Setlist</p>
              <p className="text-sm text-foreground/85">{venue.setlist}</p>
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} onClick={() => onStatusChange(venue.id, s)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${venue.status === s ? "bg-primary/15 border-primary/30 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function VenueTracker() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    base44.entities.Venue.list("-created_date", 100).then(data => {
      setVenues(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (form) => {
    const data = {
      ...form,
      capacity: form.capacity ? Number(form.capacity) : null,
      attendance: form.attendance ? Number(form.attendance) : null,
      payout_received: form.payout_received ? Number(form.payout_received) : null,
      rating: form.rating ? Number(form.rating) : null,
    };
    if (editingVenue) {
      const updated = await base44.entities.Venue.update(editingVenue.id, data);
      setVenues(prev => prev.map(v => v.id === editingVenue.id ? updated : v));
    } else {
      const created = await base44.entities.Venue.create(data);
      setVenues(prev => [created, ...prev]);
    }
    setShowForm(false);
    setEditingVenue(null);
  };

  const handleEdit = (venue) => {
    setEditingVenue(venue);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await base44.entities.Venue.delete(id);
    setVenues(prev => prev.filter(v => v.id !== id));
  };

  const handleStatusChange = async (id, status) => {
    await base44.entities.Venue.update(id, { status });
    setVenues(prev => prev.map(v => v.id === id ? { ...v, status } : v));
  };

  const filtered = venues.filter(v => {
    const matchSearch = !search || v.name?.toLowerCase().includes(search.toLowerCase()) || v.city?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: venues.filter(v => v.status === s).length }), {});

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Touring</p>
            <h1 className="font-heading text-4xl font-bold">Venue Tracker</h1>
            <p className="text-muted-foreground text-sm mt-1">Track booking contacts, requirements, and show history.</p>
          </div>
          <Button onClick={() => { setEditingVenue(null); setShowForm(v => !v); }} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />Add Venue
          </Button>
        </motion.div>

        {/* Status summary */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "All" : s)}
              className={`rounded-xl p-3 text-center border transition-colors ${filterStatus === s ? "border-primary/40 bg-primary/10" : "border-border bg-card hover:border-primary/20"}`}>
              <p className="font-heading font-bold text-xl">{counts[s] || 0}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{s}</p>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <VenueForm
                initial={editingVenue}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditingVenue(null); }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search venues..." className="pl-9" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="All">All Statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">No venues yet. Add your first prospect!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(venue => (
              <VenueCard key={venue.id} venue={venue} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}