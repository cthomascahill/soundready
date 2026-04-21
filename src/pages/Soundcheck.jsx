import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, Music2, StickyNote, Package, CheckSquare, Square, ChevronDown, ChevronUp, Upload, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const GEAR_CATEGORIES = [
  "Cables & Adapters",
  "Audio Gear",
  "Instruments",
  "Lighting",
  "Merch",
  "Personal",
  "Tech & Devices",
  "Other",
];

const DEFAULT_GEAR = [
  { id: "1", item: "XLR cables (x4)", category: "Cables & Adapters", checked: false },
  { id: "2", item: "Guitar / instrument cable", category: "Cables & Adapters", checked: false },
  { id: "3", item: "Power strip / extension cord", category: "Tech & Devices", checked: false },
  { id: "4", item: "DI box", category: "Audio Gear", checked: false },
  { id: "5", item: "In-ear monitors / headphones", category: "Audio Gear", checked: false },
  { id: "6", item: "Laptop + charger", category: "Tech & Devices", checked: false },
  { id: "7", item: "USB drive (backing tracks)", category: "Tech & Devices", checked: false },
  { id: "8", item: "Setlist printouts", category: "Personal", checked: false },
  { id: "9", item: "Merch inventory", category: "Merch", checked: false },
  { id: "10", item: "Water / rider items", category: "Personal", checked: false },
];

export default function Soundcheck() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("setlist");

  // Setlist state
  const [songs, setSongs] = useState([]);
  const [newSong, setNewSong] = useState("");
  const [dragIdx, setDragIdx] = useState(null);

  // Notes state (per-song notes)
  const [expandedNote, setExpandedNote] = useState(null);

  // Gear checklist state
  const [gear, setGear] = useState(DEFAULT_GEAR);
  const [newGear, setNewGear] = useState("");
  const [newGearCat, setNewGearCat] = useState("Other");

  // Load from localStorage for persistence
  useEffect(() => {
    const saved = localStorage.getItem(`soundcheck_${user?.email}`);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.songs) setSongs(data.songs);
      if (data.gear) setGear(data.gear);
    }
  }, [user?.email]);

  const save = (updatedSongs, updatedGear) => {
    localStorage.setItem(`soundcheck_${user?.email}`, JSON.stringify({
      songs: updatedSongs ?? songs,
      gear: updatedGear ?? gear,
    }));
  };

  // Setlist handlers
  const addSong = () => {
    if (!newSong.trim()) return;
    const updated = [...songs, { id: Date.now().toString(), title: newSong.trim(), note: "", key: "", bpm: "" }];
    setSongs(updated);
    save(updated, null);
    setNewSong("");
  };

  const removeSong = (id) => {
    const updated = songs.filter((s) => s.id !== id);
    setSongs(updated);
    save(updated, null);
  };

  const updateSong = (id, patch) => {
    const updated = songs.map((s) => s.id === id ? { ...s, ...patch } : s);
    setSongs(updated);
    save(updated, null);
  };

  const moveSong = (from, to) => {
    const updated = [...songs];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    setSongs(updated);
    save(updated, null);
  };

  // Gear handlers
  const toggleGear = (id) => {
    const updated = gear.map((g) => g.id === id ? { ...g, checked: !g.checked } : g);
    setGear(updated);
    save(null, updated);
  };

  const addGear = () => {
    if (!newGear.trim()) return;
    const updated = [...gear, { id: Date.now().toString(), item: newGear.trim(), category: newGearCat, checked: false }];
    setGear(updated);
    save(null, updated);
    setNewGear("");
  };

  const removeGear = (id) => {
    const updated = gear.filter((g) => g.id !== id);
    setGear(updated);
    save(null, updated);
  };

  const resetGear = () => {
    setGear(DEFAULT_GEAR);
    save(null, DEFAULT_GEAR);
  };

  const checkedCount = gear.filter((g) => g.checked).length;
  const groupedGear = GEAR_CATEGORIES.reduce((acc, cat) => {
    const items = gear.filter((g) => g.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const TABS = [
    { id: "setlist", label: "Setlist", icon: Music2 },
    { id: "gear", label: "Gear Checklist", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Live Performance</p>
          <h1 className="font-heading text-4xl font-bold">Soundcheck</h1>
          <p className="text-muted-foreground mt-1">Organize your setlist, song notes, and everything you need for the gig.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-xl p-1 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* SETLIST TAB */}
        {activeTab === "setlist" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Add song */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a song to your setlist..."
                value={newSong}
                onChange={(e) => setNewSong(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSong()}
                className="flex-1"
              />
              <Button onClick={addSong} className="gap-2">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>

            {songs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center space-y-3">
                <Music2 className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="font-semibold text-muted-foreground">No songs yet</p>
                <p className="text-sm text-muted-foreground">Add songs to build your setlist.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {songs.map((song, i) => (
                  <motion.div key={song.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="rounded-xl bg-card border border-border overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Position */}
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>

                      {/* Drag handle */}
                      <div className="flex flex-col gap-0.5 cursor-grab shrink-0">
                        <button
                          disabled={i === 0}
                          onClick={() => moveSong(i, i - 1)}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          disabled={i === songs.length - 1}
                          onClick={() => moveSong(i, i + 1)}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Song title */}
                      <input
                        value={song.title}
                        onChange={(e) => updateSong(song.id, { title: e.target.value })}
                        className="flex-1 bg-transparent text-sm font-semibold focus:outline-none"
                      />

                      {/* Key & BPM */}
                      <input
                        value={song.key}
                        onChange={(e) => updateSong(song.id, { key: e.target.value })}
                        placeholder="Key"
                        className="w-14 bg-secondary rounded-md px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        value={song.bpm}
                        onChange={(e) => updateSong(song.id, { bpm: e.target.value })}
                        placeholder="BPM"
                        className="w-14 bg-secondary rounded-md px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary"
                      />

                      {/* Note toggle */}
                      <button
                        onClick={() => setExpandedNote(expandedNote === song.id ? null : song.id)}
                        className={`p-1.5 rounded-lg transition-colors ${song.note ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                        title="Add note"
                      >
                        <StickyNote className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button onClick={() => removeSong(song.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Note area */}
                    <AnimatePresence>
                      {expandedNote === song.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border px-4 py-3 bg-secondary/30 overflow-hidden">
                          <textarea
                            value={song.note}
                            onChange={(e) => updateSong(song.id, { note: e.target.value })}
                            placeholder="Add notes for this song — key changes, cues, transitions, shoutouts..."
                            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none min-h-[72px]"
                            autoFocus
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

            {songs.length > 0 && (
              <p className="text-xs text-muted-foreground text-center">{songs.length} song{songs.length !== 1 ? "s" : ""} · ~{Math.round(songs.length * 3.5)} min estimated</p>
            )}
          </motion.div>
        )}

        {/* GEAR CHECKLIST TAB */}
        {activeTab === "gear" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Progress */}
            <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Pack Progress</p>
                  <p className="text-xs text-muted-foreground">{checkedCount} of {gear.length} items packed</p>
                </div>
                <button onClick={resetGear} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Reset defaults</button>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  animate={{ width: `${gear.length ? (checkedCount / gear.length) * 100 : 0}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            {/* Add gear */}
            <div className="flex gap-2">
              <Input
                placeholder="Add gear item..."
                value={newGear}
                onChange={(e) => setNewGear(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGear()}
                className="flex-1"
              />
              <select
                value={newGearCat}
                onChange={(e) => setNewGearCat(e.target.value)}
                className="h-9 rounded-md border border-input bg-card px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {GEAR_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <Button onClick={addGear} className="gap-2">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>

            {/* Gear grouped by category */}
            <div className="space-y-4">
              {Object.entries(groupedGear).map(([cat, items]) => (
                <div key={cat} className="rounded-2xl bg-card border border-border overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border bg-secondary/30 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{cat}</p>
                    <p className="text-xs text-muted-foreground">{items.filter((i) => i.checked).length}/{items.length}</p>
                  </div>
                  <div className="divide-y divide-border">
                    {items.map((g) => (
                      <div key={g.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors">
                        <button onClick={() => toggleGear(g.id)} className="shrink-0">
                          {g.checked
                            ? <CheckSquare className="h-5 w-5 text-primary" />
                            : <Square className="h-5 w-5 text-muted-foreground" />}
                        </button>
                        <span className={`flex-1 text-sm ${g.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {g.item}
                        </span>
                        <button onClick={() => removeGear(g.id)} className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}