import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Save, Eye, Trash2, ExternalLink, Music, ShoppingBag, MapPin, Instagram, Youtube, Check, Copy, Palette, User, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const THEMES = {
  dark: { bg: "bg-zinc-950", card: "bg-zinc-900", accent: "bg-white text-black", text: "text-white", sub: "text-zinc-400", border: "border-zinc-800", badge: "bg-zinc-800 text-zinc-300", label: "Dark" },
  neon: { bg: "bg-black", card: "bg-zinc-900", accent: "bg-green-400 text-black", text: "text-white", sub: "text-green-400/70", border: "border-green-500/30", badge: "bg-green-500/20 text-green-400", label: "Neon" },
  minimal: { bg: "bg-white", card: "bg-gray-50", accent: "bg-black text-white", text: "text-gray-900", sub: "text-gray-500", border: "border-gray-200", badge: "bg-gray-100 text-gray-600", label: "Minimal" },
  sunset: { bg: "bg-gradient-to-br from-orange-950 via-rose-950 to-purple-950", card: "bg-white/10", accent: "bg-orange-400 text-black", text: "text-white", sub: "text-orange-200/70", border: "border-orange-500/30", badge: "bg-orange-500/20 text-orange-300", label: "Sunset" },
  forest: { bg: "bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950", card: "bg-white/10", accent: "bg-emerald-400 text-black", text: "text-white", sub: "text-emerald-200/70", border: "border-emerald-500/30", badge: "bg-emerald-500/20 text-emerald-300", label: "Forest" },
  ocean: { bg: "bg-gradient-to-br from-blue-950 via-cyan-950 to-indigo-950", card: "bg-white/10", accent: "bg-cyan-400 text-black", text: "text-white", sub: "text-cyan-200/70", border: "border-cyan-500/30", badge: "bg-cyan-500/20 text-cyan-300", label: "Ocean" },
};

const THEME_COLORS = { dark: "bg-zinc-900 border-zinc-700", neon: "bg-black border-green-500", minimal: "bg-white border-gray-300", sunset: "bg-gradient-to-r from-orange-500 to-purple-600", forest: "bg-gradient-to-r from-emerald-600 to-teal-600", ocean: "bg-gradient-to-r from-blue-600 to-cyan-500" };

function PreviewPage({ page }) {
  const t = THEMES[page.theme] || THEMES.dark;
  return (
    <div className={`min-h-screen ${t.bg} flex items-start justify-center py-10 px-4`}>
      <div className="w-full max-w-sm space-y-4">
        {/* Artist header */}
        <div className="text-center space-y-2 pb-2">
          {page.avatar_url ? (
            <img src={page.avatar_url} alt={page.artist_name} className="h-20 w-20 rounded-full object-cover mx-auto border-2 border-white/20" />
          ) : (
            <div className={`h-20 w-20 rounded-full ${t.card} border ${t.border} flex items-center justify-center mx-auto`}>
              <User className={`h-8 w-8 ${t.sub}`} />
            </div>
          )}
          <p className={`font-heading font-bold text-2xl ${t.text}`}>{page.artist_name}</p>
          {page.tagline && <p className={`text-sm ${t.sub}`}>{page.tagline}</p>}
          {page.bio && <p className={`text-xs ${t.sub} leading-relaxed max-w-xs mx-auto`}>{page.bio}</p>}
        </div>

        {/* Social links */}
        {page.social_links && Object.values(page.social_links).some(Boolean) && (
          <div className="flex justify-center gap-3 flex-wrap">
            {[
              { key: "spotify", label: "Spotify" }, { key: "instagram", label: "Instagram" },
              { key: "tiktok", label: "TikTok" }, { key: "youtube", label: "YouTube" }, { key: "twitter", label: "Twitter" },
            ].filter((s) => page.social_links?.[s.key]).map((s) => (
              <a key={s.key} href={page.social_links[s.key]} target="_blank" rel="noopener noreferrer"
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${t.border} ${t.badge} hover:opacity-80 transition-opacity`}>
                {s.label}
              </a>
            ))}
          </div>
        )}

        {/* Song links */}
        {page.song_links?.length > 0 && (
          <div className="space-y-2">
            <p className={`text-xs uppercase tracking-widest font-medium ${t.sub} text-center`}>🎵 Listen Now</p>
            {page.song_links.map((song, i) => (
              <div key={i} className={`rounded-xl ${t.card} border ${t.border} p-3 space-y-2`}>
                <p className={`font-semibold text-sm ${t.text}`}>{song.title}</p>
                <div className="flex flex-wrap gap-2">
                  {song.spotify_url && <a href={song.spotify_url} target="_blank" rel="noopener noreferrer" className={`px-3 py-1 rounded-full text-xs ${t.accent} font-medium`}>Spotify</a>}
                  {song.apple_url && <a href={song.apple_url} target="_blank" rel="noopener noreferrer" className={`px-3 py-1 rounded-full text-xs border ${t.border} ${t.badge}`}>Apple Music</a>}
                  {song.youtube_url && <a href={song.youtube_url} target="_blank" rel="noopener noreferrer" className={`px-3 py-1 rounded-full text-xs border ${t.border} ${t.badge}`}>YouTube</a>}
                  {song.tiktok_url && <a href={song.tiktok_url} target="_blank" rel="noopener noreferrer" className={`px-3 py-1 rounded-full text-xs border ${t.border} ${t.badge}`}>TikTok</a>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tour dates */}
        {page.tour_dates?.length > 0 && (
          <div className="space-y-2">
            <p className={`text-xs uppercase tracking-widest font-medium ${t.sub} text-center`}>📍 Tour Dates</p>
            {page.tour_dates.map((date, i) => (
              <div key={i} className={`rounded-xl ${t.card} border ${t.border} p-3 flex items-center justify-between gap-2`}>
                <div>
                  <p className={`text-sm font-semibold ${t.text}`}>{date.venue}</p>
                  <p className={`text-xs ${t.sub}`}>{date.city} · {date.date}</p>
                </div>
                {date.ticket_url && (
                  <a href={date.ticket_url} target="_blank" rel="noopener noreferrer"
                    className={`px-3 py-1.5 rounded-full text-xs ${t.accent} font-medium shrink-0`}>Tickets</a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Merch */}
        {page.merch_items?.length > 0 && (
          <div className="space-y-2">
            <p className={`text-xs uppercase tracking-widest font-medium ${t.sub} text-center`}>🛍️ Merch</p>
            <div className="grid grid-cols-2 gap-2">
              {page.merch_items.map((item, i) => (
                <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
                  className={`rounded-xl ${t.card} border ${t.border} p-3 space-y-1 block hover:opacity-80 transition-opacity`}>
                  {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-20 object-cover rounded-lg mb-2" />}
                  <p className={`text-xs font-semibold ${t.text}`}>{item.name}</p>
                  {item.price && <p className={`text-xs ${t.sub}`}>{item.price}</p>}
                </a>
              ))}
            </div>
          </div>
        )}

        <p className={`text-center text-[10px] ${t.sub} pt-4`}>Powered by SoundReady</p>
      </div>
    </div>
  );
}

function SongLinkRow({ link, onChange, onRemove }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Input placeholder="Song title" value={link.title} onChange={(e) => onChange({ ...link, title: e.target.value })} className="h-8 text-sm" />
        <button onClick={onRemove} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Spotify URL" value={link.spotify_url || ""} onChange={(e) => onChange({ ...link, spotify_url: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="Apple Music URL" value={link.apple_url || ""} onChange={(e) => onChange({ ...link, apple_url: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="YouTube URL" value={link.youtube_url || ""} onChange={(e) => onChange({ ...link, youtube_url: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="TikTok URL" value={link.tiktok_url || ""} onChange={(e) => onChange({ ...link, tiktok_url: e.target.value })} className="h-8 text-xs" />
      </div>
    </div>
  );
}

function TourRow({ date, onChange, onRemove }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Venue name" value={date.venue || ""} onChange={(e) => onChange({ ...date, venue: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="City, State" value={date.city || ""} onChange={(e) => onChange({ ...date, city: e.target.value })} className="h-8 text-xs" />
        <Input type="date" value={date.date || ""} onChange={(e) => onChange({ ...date, date: e.target.value })} className="h-8 text-xs" />
        <div className="flex gap-1">
          <Input placeholder="Ticket URL" value={date.ticket_url || ""} onChange={(e) => onChange({ ...date, ticket_url: e.target.value })} className="h-8 text-xs" />
          <button onClick={onRemove} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

function MerchRow({ item, onChange, onRemove }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Item name" value={item.name || ""} onChange={(e) => onChange({ ...item, name: e.target.value })} className="h-8 text-xs" />
        <div className="flex gap-1">
          <Input placeholder="Price (e.g. $25)" value={item.price || ""} onChange={(e) => onChange({ ...item, price: e.target.value })} className="h-8 text-xs" />
          <button onClick={onRemove} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-4 w-4" /></button>
        </div>
        <Input placeholder="Store URL" value={item.url || ""} onChange={(e) => onChange({ ...item, url: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="Image URL" value={item.image_url || ""} onChange={(e) => onChange({ ...item, image_url: e.target.value })} className="h-8 text-xs" />
      </div>
    </div>
  );
}

const BLANK_PAGE = { artist_name: "", tagline: "", bio: "", avatar_url: "", theme: "dark", song_links: [], tour_dates: [], merch_items: [], social_links: { instagram: "", tiktok: "", twitter: "", youtube: "", spotify: "" } };

export default function LinkInBio() {
  const [pages, setPages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  const [calEvents, setCalEvents] = useState([]);
  const [tab, setTab] = useState("songs");

  useEffect(() => {
    Promise.all([
      base44.entities.LinkInBioPage.list("-created_date", 20),
      base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 20),
      base44.entities.CalendarEvent.list("-date", 20).catch(() => []),
    ]).then(([pgs, sgs, cal]) => {
      setPages(pgs);
      setSongs(sgs);
      setCalEvents(cal.filter((e) => e.type === "release" || e.type === "pre_release" || e.type === "manual"));
      setLoading(false);
    });
  }, []);

  const startNew = () => {
    const draft = { ...BLANK_PAGE };
    // Auto-populate songs from library
    draft.song_links = songs.slice(0, 5).map((s) => ({ title: s.title, spotify_url: "", apple_url: "", youtube_url: "", tiktok_url: "" }));
    draft.tour_dates = calEvents.filter((e) => e.type === "release" || e.type === "manual").slice(0, 5).map((e) => ({ date: e.date, venue: e.platform || e.title, city: "", ticket_url: "" }));
    setEditing(draft);
    setPreview(false);
  };

  const openExisting = (page) => { setEditing({ ...page }); setPreview(false); };

  const save = async () => {
    setSaving(true);
    const slug = editing.slug || editing.artist_name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const data = { ...editing, slug };
    let record;
    if (editing.id) {
      record = await base44.entities.LinkInBioPage.update(editing.id, data);
    } else {
      record = await base44.entities.LinkInBioPage.create(data);
    }
    setEditing({ ...record });
    setPages((prev) => editing.id ? prev.map((p) => p.id === record.id ? record : p) : [record, ...prev]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deletePage = async (id) => {
    await base44.entities.LinkInBioPage.delete(id);
    setPages((prev) => prev.filter((p) => p.id !== id));
    if (editing?.id === id) setEditing(null);
  };

  const updateSongLink = (i, val) => setEditing((e) => ({ ...e, song_links: e.song_links.map((s, idx) => idx === i ? val : s) }));
  const updateTour = (i, val) => setEditing((e) => ({ ...e, tour_dates: e.tour_dates.map((d, idx) => idx === i ? val : d) }));
  const updateMerch = (i, val) => setEditing((e) => ({ ...e, merch_items: e.merch_items.map((m, idx) => idx === i ? val : m) }));

  if (preview && editing) return (
    <div>
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setPreview(false)}>← Back to Editor</Button>
        <Button size="sm" onClick={save} disabled={saving}>{saved ? <><Check className="h-3.5 w-3.5 mr-1" />Saved</> : saving ? "Saving..." : <><Save className="h-3.5 w-3.5 mr-1" />Save</>}</Button>
      </div>
      <PreviewPage page={editing} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Release Marketing</p>
          <h1 className="font-heading text-4xl font-bold">Link-in-Bio Builder</h1>
          <p className="text-muted-foreground">Create a custom landing page for every release — auto-populated with your song links, tour dates, and merch.</p>
        </motion.div>

        {!editing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{pages.length} Page{pages.length !== 1 ? "s" : ""}</p>
              <Button onClick={startNew} className="gap-2"><Plus className="h-4 w-4" />New Page</Button>
            </div>
            {loading ? <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
            : pages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center space-y-4">
                <Link className="h-10 w-10 text-muted-foreground mx-auto" />
                <div><p className="font-semibold">No pages yet</p><p className="text-muted-foreground text-sm">Create your first link-in-bio page</p></div>
                <Button onClick={startNew} className="gap-2"><Plus className="h-4 w-4" />Create Page</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pages.map((page) => (
                  <div key={page.id} className={`rounded-2xl bg-card border border-border overflow-hidden`}>
                    <div className={`h-20 ${THEME_COLORS[page.theme] || "bg-zinc-900"} flex items-center justify-center`}>
                      <p className="font-heading font-bold text-white text-lg">{page.artist_name}</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-muted-foreground">{page.tagline || "No tagline"} · {page.theme} theme</p>
                      <p className="text-xs text-muted-foreground">{page.song_links?.length || 0} songs · {page.tour_dates?.length || 0} dates · {page.merch_items?.length || 0} merch</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => openExisting(page)}><Plus className="h-3 w-3" />Edit</Button>
                        <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => { setEditing({ ...page }); setPreview(true); }}><Eye className="h-3 w-3" />Preview</Button>
                        <button onClick={() => deletePage(page.id)} className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Editor */}
            <div className="lg:col-span-3 space-y-5">
              <div className="flex items-center justify-between">
                <button onClick={() => setEditing(null)} className="text-sm text-muted-foreground hover:text-foreground">← All Pages</button>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPreview(true)}><Eye className="h-3.5 w-3.5 mr-1.5" />Preview</Button>
                  <Button size="sm" onClick={save} disabled={saving}>{saved ? <><Check className="h-3.5 w-3.5 mr-1" />Saved</> : saving ? "Saving..." : <><Save className="h-3.5 w-3.5 mr-1" />Save</>}</Button>
                </div>
              </div>

              {/* Profile */}
              <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
                <p className="font-heading font-semibold flex items-center gap-2"><User className="h-4 w-4 text-primary" />Profile</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Artist name *" value={editing.artist_name} onChange={(e) => setEditing((d) => ({ ...d, artist_name: e.target.value }))} />
                  <Input placeholder="Tagline" value={editing.tagline} onChange={(e) => setEditing((d) => ({ ...d, tagline: e.target.value }))} />
                  <Input placeholder="Avatar image URL" value={editing.avatar_url} onChange={(e) => setEditing((d) => ({ ...d, avatar_url: e.target.value }))} className="col-span-2" />
                  <textarea value={editing.bio} onChange={(e) => setEditing((d) => ({ ...d, bio: e.target.value }))}
                    placeholder="Short bio (optional)" rows={2}
                    className="col-span-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                </div>
              </div>

              {/* Theme */}
              <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                <p className="font-heading font-semibold flex items-center gap-2"><Palette className="h-4 w-4 text-primary" />Background Theme</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(THEMES).map(([key, t]) => (
                    <button key={key} onClick={() => setEditing((d) => ({ ...d, theme: key }))}
                      className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${editing.theme === key ? "border-primary" : "border-border"}`}>
                      <div className={`h-8 rounded-lg mb-2 ${THEME_COLORS[key]}`} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social links */}
              <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                <p className="font-heading font-semibold flex items-center gap-2"><Instagram className="h-4 w-4 text-primary" />Social Links</p>
                <div className="grid grid-cols-2 gap-2">
                  {["spotify", "instagram", "tiktok", "youtube", "twitter"].map((platform) => (
                    <Input key={platform} placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                      value={editing.social_links?.[platform] || ""}
                      onChange={(e) => setEditing((d) => ({ ...d, social_links: { ...d.social_links, [platform]: e.target.value } }))}
                      className="h-8 text-xs" />
                  ))}
                </div>
              </div>

              {/* Tabs for songs / tour / merch */}
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="flex border-b border-border">
                  {[{ key: "songs", icon: Music, label: "Songs" }, { key: "tour", icon: MapPin, label: "Tour Dates" }, { key: "merch", icon: ShoppingBag, label: "Merch" }].map(({ key, icon: Icon, label }) => (
                    <button key={key} onClick={() => setTab(key)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${tab === key ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      <Icon className="h-3.5 w-3.5" />{label}
                    </button>
                  ))}
                </div>
                <div className="p-4 space-y-3">
                  {tab === "songs" && (
                    <>
                      {editing.song_links.map((link, i) => (
                        <SongLinkRow key={i} link={link} onChange={(v) => updateSongLink(i, v)} onRemove={() => setEditing((d) => ({ ...d, song_links: d.song_links.filter((_, idx) => idx !== i) }))} />
                      ))}
                      <Button size="sm" variant="outline" className="w-full gap-1" onClick={() => setEditing((d) => ({ ...d, song_links: [...d.song_links, { title: "", spotify_url: "", apple_url: "", youtube_url: "", tiktok_url: "" }] }))}>
                        <Plus className="h-3.5 w-3.5" /> Add Song
                      </Button>
                    </>
                  )}
                  {tab === "tour" && (
                    <>
                      {editing.tour_dates.map((date, i) => (
                        <TourRow key={i} date={date} onChange={(v) => updateTour(i, v)} onRemove={() => setEditing((d) => ({ ...d, tour_dates: d.tour_dates.filter((_, idx) => idx !== i) }))} />
                      ))}
                      <Button size="sm" variant="outline" className="w-full gap-1" onClick={() => setEditing((d) => ({ ...d, tour_dates: [...d.tour_dates, { date: "", venue: "", city: "", ticket_url: "" }] }))}>
                        <Plus className="h-3.5 w-3.5" /> Add Date
                      </Button>
                    </>
                  )}
                  {tab === "merch" && (
                    <>
                      {editing.merch_items.map((item, i) => (
                        <MerchRow key={i} item={item} onChange={(v) => updateMerch(i, v)} onRemove={() => setEditing((d) => ({ ...d, merch_items: d.merch_items.filter((_, idx) => idx !== i) }))} />
                      ))}
                      <Button size="sm" variant="outline" className="w-full gap-1" onClick={() => setEditing((d) => ({ ...d, merch_items: [...d.merch_items, { name: "", price: "", url: "", image_url: "" }] }))}>
                        <Plus className="h-3.5 w-3.5" /> Add Merch
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Live mini preview */}
            <div className="lg:col-span-2">
              <div className="sticky top-20 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Live Preview</p>
                <div className="rounded-2xl border border-border overflow-hidden h-[600px] overflow-y-auto scale-90 origin-top">
                  <PreviewPage page={editing} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}