import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Mic2, Map, Trash2, X, Check, ChevronRight, Calendar, AlertTriangle,
} from "lucide-react";

const STATUS_STYLES = {
  Planning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25",
  Active: "bg-primary/10 text-primary border-primary/25",
  Completed: "bg-secondary text-muted-foreground border-border",
};

// ─── New Tour Modal ───────────────────────────────────────────────────────────
function NewTourModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    status: "Planning",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target?.value ?? e }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading font-bold text-lg">Plan a New Tour</p>
            <p className="text-xs text-muted-foreground">Give it a name — you'll add shows next.</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Tour Name *</label>
            <Input value={form.name} onChange={set("name")} placeholder="e.g. Summer 2026 Tour" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Start Date</label>
              <Input type="date" value={form.start_date} onChange={set("start_date")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">End Date</label>
              <Input type="date" value={form.end_date} onChange={set("end_date")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Status</label>
            <select value={form.status} onChange={set("status")}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              {["Planning", "Active", "Completed"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button onClick={() => onSave(form)} disabled={!form.name.trim()} className="flex-1 gap-2">
            <Check className="h-4 w-4" />Create Tour
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Tour card ────────────────────────────────────────────────────────────────
function TourCard({ tour, shows, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dates = shows.map((v) => v.performance_date).filter(Boolean).sort();
  const cities = [...new Set(shows.map((v) => v.city).filter(Boolean))].slice(0, 4);
  const range = dates.length
    ? `${moment(dates[0]).format("MMM D, YYYY")}${dates.length > 1 ? ` – ${moment(dates[dates.length - 1]).format("MMM D, YYYY")}` : ""}`
    : "No shows yet";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading font-bold text-lg truncate">{tour.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
            <Calendar className="h-3 w-3" />{range}
          </p>
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[tour.status] || STATUS_STYLES.Planning}`}>
          {tour.status || "Planning"}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Mic2 className="h-3 w-3" />{shows.length} show{shows.length === 1 ? "" : "s"}</span>
        {cities.length > 0 && <span className="truncate flex items-center gap-1"><Map className="h-3 w-3" />{cities.join(", ")}</span>}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-1">
        {confirmDelete ? (
          <>
            <Button variant="destructive" size="sm" onClick={() => onDelete(tour)} className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />Delete Tour
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
          </>
        ) : (
          <>
            <Button asChild size="sm" className="gap-1.5 flex-1">
              <Link to={`/tour-planner/${tour.id}`}>Open Planner <ChevronRight className="h-3.5 w-3.5" /></Link>
            </Button>
            <Button variant="ghost" size="sm"
              onClick={() => setConfirmDelete(true)}
              className="text-muted-foreground hover:text-destructive h-8 w-8 p-0 shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main list page ───────────────────────────────────────────────────────────
export default function TourPlanner() {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [unassignedShows, setUnassignedShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTourOpen, setNewTourOpen] = useState(false);
  const [allVenues, setAllVenues] = useState([]);

  const load = async () => {
    setLoading(true);
    const [tourList, venues] = await Promise.all([
      base44.entities.TourRoute.list("-created_date", 100).catch(() => []),
      base44.entities.Venue.list("performance_date", 500).catch(() => []),
    ]);
    const booked = venues.filter((v) => v.performance_date && (v.status === "Booked" || v.status === "Performed"));

    if (tourList.length === 0 && (booked.length > 0)) {
      // First time in the multi-tour planner: move existing shows/tasks into one tour
      const tour = await base44.entities.TourRoute.create({ name: "My Shows", status: "Active" });
      const withTour = booked.map((v) => ({ ...v, tour_id: tour.id }));
      await base44.entities.Venue.bulkUpdate(booked.map((v) => ({ id: v.id, tour_id: tour.id }))).catch(() => {});
      const tasks = await base44.entities.TourLogisticsTask.list("date", 500).catch(() => []);
      if (tasks.length > 0) {
        await base44.entities.TourLogisticsTask.bulkUpdate(tasks.map((t) => ({ id: t.id, tour_id: tour.id }))).catch(() => {});
      }
      tourList.push(tour);
      setAllVenues(withTour);
      setUnassignedShows([]);
    } else {
      setAllVenues(venues);
      setUnassignedShows(booked.filter((v) => !v.tour_id));
    }
    setTours(tourList);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreateTour = async (form) => {
    const created = await base44.entities.TourRoute.create(form);
    setNewTourOpen(false);
    navigate(`/tour-planner/${created.id}`);
  };

  const handleCreateFromUnassigned = async () => {
    const tour = await base44.entities.TourRoute.create({ name: "Unbooked Shows", status: "Planning" });
    await base44.entities.Venue.bulkUpdate(unassignedShows.map((v) => ({ id: v.id, tour_id: tour.id })));
    await load();
  };

  const handleDeleteTour = async (tour) => {
    await base44.entities.TourLogisticsTask.deleteMany({ tour_id: tour.id }).catch(() => {});
    await base44.entities.TourExpense.deleteMany({ tour_id: tour.id }).catch(() => {});
    await base44.entities.Venue.updateMany({ tour_id: tour.id }, { $unset: { tour_id: "" } }).catch(() => {});
    await base44.entities.TourRoute.delete(tour.id);
    await load();
  };

  const showsByTour = {};
  allVenues.forEach((v) => {
    if (!v.tour_id) return;
    if (!showsByTour[v.tour_id]) showsByTour[v.tour_id] = [];
    showsByTour[v.tour_id].push(v);
  });

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      {newTourOpen && <NewTourModal onSave={handleCreateTour} onClose={() => setNewTourOpen(false)} />}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Touring</p>
            <h1 className="font-heading text-4xl font-bold">Tour Planner</h1>
            <p className="text-muted-foreground text-sm mt-1">Plan a new tour, or open an existing one to keep working on it.</p>
          </div>
          <Button onClick={() => setNewTourOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />Plan a New Tour
          </Button>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Tours grid */}
            {tours.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <Map className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-heading font-bold text-lg">No tours yet</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first tour and start adding shows.</p>
                <Button onClick={() => setNewTourOpen(true)} className="gap-2 mx-auto">
                  <Plus className="h-4 w-4" />Plan a New Tour
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} shows={showsByTour[tour.id] || []} onDelete={handleDeleteTour} />
                ))}
              </div>
            )}

            {/* Unassigned shows notice */}
            {unassignedShows.length > 0 && (
              <div className="rounded-2xl bg-yellow-500/5 border border-yellow-500/25 p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
                  <span className="text-muted-foreground">
                    <span className="text-foreground font-medium">{unassignedShows.length} show{unassignedShows.length === 1 ? "" : "s"}</span> not in any tour.
                  </span>
                </div>
                <Button size="sm" variant="outline" onClick={handleCreateFromUnassigned} className="gap-1.5 shrink-0">
                  <Plus className="h-3.5 w-3.5" />Create a tour for these
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}