import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, Mic2, Hotel, Car, Plane,
  Music2, Megaphone, ShoppingBag, Utensils, CircleDot, X, Check,
  GripVertical, MapPin, DollarSign, ArrowRight, Clock, AlertTriangle, Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";
import { getDrivingRoute } from "@/lib/routeDistance";
import HotelEstimator from "@/components/tourplanner/HotelEstimator";
import TourAnalyticsDashboard from "@/components/tourplanner/TourAnalyticsDashboard";
import ExportTourPDF from "@/components/tourplanner/ExportTourPDF";
import TourRouteMap from "@/components/tourplanner/TourRouteMap";
import VenuePinningPanel from "@/components/tourplanner/VenuePinningPanel";

// ─── Category config ─────────────────────────────────────────────────────────
const CATEGORIES = {
  Hotel:      { icon: Hotel,       color: "text-chart-5",   bg: "bg-chart-5/15",   border: "border-chart-5/30" },
  Travel:     { icon: Car,         color: "text-orange-400",bg: "bg-orange-500/15",border: "border-orange-500/30" },
  "Rental Car": { icon: Car,       color: "text-orange-400",bg: "bg-orange-500/15",border: "border-orange-500/30" },
  Flight:     { icon: Plane,       color: "text-cyan-400",  bg: "bg-cyan-500/15",  border: "border-cyan-500/30" },
  Soundcheck: { icon: Music2,      color: "text-primary",   bg: "bg-primary/15",   border: "border-primary/30" },
  Promotion:  { icon: Megaphone,   color: "text-purple-400",bg: "bg-purple-500/15",border: "border-purple-500/30" },
  Merch:      { icon: ShoppingBag, color: "text-pink-400",  bg: "bg-pink-500/15",  border: "border-pink-500/30" },
  Food:       { icon: Utensils,    color: "text-yellow-400",bg: "bg-yellow-500/15",border: "border-yellow-500/30" },
  Other:      { icon: CircleDot,   color: "text-muted-foreground", bg: "bg-secondary", border: "border-border" },
};

const STATUS_COLORS = {
  Todo:        "text-muted-foreground",
  "In Progress":"text-yellow-400",
  Done:        "text-primary",
};

const CATEGORY_LIST = Object.keys(CATEGORIES);

// ─── Task pill (draggable) ────────────────────────────────────────────────────
function TaskPill({ task, onEdit, onDelete, onToggleDone, isDragging, dragHandleProps }) {
  const cat = CATEGORIES[task.category] || CATEGORIES.Other;
  const CatIcon = cat.icon;
  return (
    <div
      {...dragHandleProps}
      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 border text-xs cursor-grab active:cursor-grabbing select-none transition-shadow ${cat.bg} ${cat.border} ${isDragging ? "shadow-lg ring-1 ring-primary/40 opacity-80" : ""}`}
    >
      <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
      <CatIcon className={`h-3 w-3 shrink-0 ${cat.color}`} />
      <span className={`flex-1 min-w-0 truncate font-medium ${task.status === "Done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
        {task.title}
      </span>
      <button onClick={() => onToggleDone(task)} className={`shrink-0 ${STATUS_COLORS[task.status]}`}>
        <Check className="h-3 w-3" />
      </button>
      <button onClick={() => onEdit(task)} className="shrink-0 text-muted-foreground hover:text-foreground">
        <CircleDot className="h-3 w-3" />
      </button>
      <button onClick={() => onDelete(task.id)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── Add/Edit task modal ──────────────────────────────────────────────────────
function TaskModal({ task, date, prefill, venues, onSave, onClose }) {
  const [form, setForm] = useState(
    task
      ? { ...task }
      : { date: date || "", title: prefill?.title || "", category: prefill?.category || "Hotel", status: "Todo", notes: "", cost: prefill?.cost || "", priority: "Medium", venue_id: "" }
  );
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-heading font-bold">{task ? "Edit Task" : `Add Task — ${moment(form.date).format("MMM D")}`}</p>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Task Title *</label>
            <Input value={form.title} onChange={set("title")} placeholder="e.g. Book Hampton Inn, Nashville" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Category</label>
              <select value={form.category} onChange={set("category")} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                {CATEGORY_LIST.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Status</label>
              <select value={form.status} onChange={set("status")} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                {["Todo", "In Progress", "Done"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Priority</label>
              <select value={form.priority} onChange={set("priority")} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                {["Low", "Medium", "High"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Cost ($)</label>
              <Input type="number" value={form.cost} onChange={set("cost")} placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Link to Venue (optional)</label>
            <select value={form.venue_id} onChange={set("venue_id")} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">None</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name} — {v.city}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Notes</label>
            <textarea value={form.notes} onChange={set("notes")} rows={2}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button onClick={() => onSave({ ...form, cost: form.cost ? Number(form.cost) : null })} disabled={!form.title} className="flex-1">
            <Check className="h-4 w-4 mr-2" />{task ? "Update" : "Add Task"}
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Show badge inside day ────────────────────────────────────────────────────
function ShowBadge({ venue, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-1 rounded-md px-2 py-1 bg-primary/15 border border-primary/30 text-[10px] font-semibold text-primary truncate hover:bg-primary/25 transition-colors text-left">
      <Mic2 className="h-2.5 w-2.5 shrink-0" />
      <span className="truncate flex-1">{venue.name}</span>
    </button>
  );
}

// ─── Travel gap indicator ─────────────────────────────────────────────────────
function TravelGap({ from, to, route, loading }) {
  if (!from || !to) return null;
  if (from.city === to.city) return null;

  // Warn if > 8 hours drive OR > 500 miles
  const isLong = route && (route.durationHours > 8 || route.distanceMiles > 500);
  const isVeryLong = route && (route.durationHours > 12 || route.distanceMiles > 800);

  const formatDuration = (h) => {
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  return (
    <div className={`rounded-md px-2 py-1 border text-[10px] space-y-0.5 ${
      isVeryLong ? "bg-yellow-500/10 border-yellow-500/25 text-yellow-400" :
      isLong     ? "bg-yellow-500/10 border-yellow-500/25 text-yellow-400" :
                   "bg-orange-500/10 border-orange-500/20 text-orange-400"
    }`}>
      <div className="flex items-center gap-1 truncate font-medium">
        {isVeryLong ? <AlertTriangle className="h-2.5 w-2.5 shrink-0" /> : <ArrowRight className="h-2.5 w-2.5 shrink-0" />}
        <span className="truncate">{from.city} → {to.city}</span>
      </div>
      {loading && <div className="text-[9px] opacity-60">Calculating...</div>}
      {route && !loading && (
        <div className="flex items-center gap-1 text-[9px] opacity-80">
          <Navigation className="h-2 w-2 shrink-0" />
          {route.distanceMiles} mi · {formatDuration(route.durationHours)}
          {isVeryLong && <span className="font-bold ml-1">⚠ Very long haul</span>}
          {isLong && !isVeryLong && <span className="font-bold ml-1">Long drive</span>}
        </div>
      )}
    </div>
  );
}

// ─── Day cell ─────────────────────────────────────────────────────────────────
function DayCell({ dateStr, isCurrentMonth, isToday, shows, travelGap, travelRoute, travelLoading, tasks, onAddTask, onEditTask, onDeleteTask, onToggleDone, onDragOver, onDrop, onDragStart, onEditShow }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
    onDragOver(dateStr);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    onDrop(dateStr);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-[120px] rounded-xl border p-2 flex flex-col gap-1 transition-colors ${
        dragOver ? "border-primary/50 bg-primary/5" :
        isToday ? "border-primary/40 bg-primary/5" :
        isCurrentMonth ? "border-border bg-card" :
        "border-border/40 bg-card/30"
      }`}
    >
      {/* Date number */}
      <div className="flex items-center justify-between mb-0.5">
        <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
          isToday ? "bg-primary text-primary-foreground" : isCurrentMonth ? "text-foreground" : "text-muted-foreground/50"
        }`}>
          {moment(dateStr).date()}
        </span>
        <button onClick={() => onAddTask(dateStr)}
          className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100">
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Shows */}
      {shows.map(v => <ShowBadge key={v.id} venue={v} onClick={() => onEditShow(v)} />)}

      {/* Travel gap */}
      {travelGap && <TravelGap from={travelGap.from} to={travelGap.to} route={travelRoute} loading={travelLoading} />}

      {/* Tasks */}
      {tasks.map(task => (
        <div key={task.id} draggable
          onDragStart={() => onDragStart(task)}>
          <TaskPill
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onToggleDone={onToggleDone}
          />
        </div>
      ))}

      {/* Add button always visible at bottom */}
      <button onClick={() => onAddTask(dateStr)}
        className="mt-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors py-0.5">
        <Plus className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

// ─── Edit Show Modal ─────────────────────────────────────────────────────────
function EditShowModal({ venue, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    name: venue.name || "",
    city: venue.city || "",
    state: venue.state || "",
    performance_date: venue.performance_date ? moment(venue.performance_date).format("YYYY-MM-DD") : "",
    performance_time: venue.performance_time || "",
    payout_amount: venue.payout_amount || "",
    payout_structure: venue.payout_structure || "Flat Fee",
    capacity: venue.capacity || "",
    notes: venue.notes || "",
    status: venue.status || "Booked",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading font-bold text-lg">Edit Show</p>
            <p className="text-xs text-muted-foreground">{venue.name}</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Venue Name *</label>
            <Input value={form.name} onChange={set("name")} placeholder="e.g. The Troubadour" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">City *</label>
              <Input value={form.city} onChange={set("city")} placeholder="e.g. Los Angeles" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">State</label>
              <Input value={form.state} onChange={set("state")} placeholder="e.g. CA" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Show Date *</label>
              <Input type="date" value={form.performance_date} onChange={set("performance_date")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Show Time</label>
              <Input value={form.performance_time} onChange={set("performance_time")} placeholder="e.g. 9:00 PM" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Payout ($)</label>
              <Input type="number" value={form.payout_amount} onChange={set("payout_amount")} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Status</label>
              <select value={form.status} onChange={set("status")} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                {["Booked", "Performed", "Cancelled"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Notes</label>
            <textarea value={form.notes} onChange={set("notes")} rows={2}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            onClick={() => onSave(form)}
            disabled={!form.name || !form.city || !form.performance_date}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />Save Changes
          </Button>
          {confirmDelete ? (
            <Button variant="destructive" onClick={() => onDelete(venue.id)} className="gap-1">
              Confirm Delete
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setConfirmDelete(true)} className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1">
              <X className="h-4 w-4" />Delete
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Add Show Modal ───────────────────────────────────────────────────────────
function AddShowModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: "", city: "", state: "", performance_date: moment().format("YYYY-MM-DD"),
    performance_time: "", payout_amount: "", payout_structure: "Flat Fee",
    capacity: "", notes: "", status: "Booked",
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading font-bold text-lg">Add Show</p>
            <p className="text-xs text-muted-foreground">This will appear on the calendar as a confirmed show.</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Venue Name *</label>
            <Input value={form.name} onChange={set("name")} placeholder="e.g. The Troubadour" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">City *</label>
              <Input value={form.city} onChange={set("city")} placeholder="e.g. Los Angeles" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">State</label>
              <Input value={form.state} onChange={set("state")} placeholder="e.g. CA" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Show Date *</label>
              <Input type="date" value={form.performance_date} onChange={set("performance_date")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Show Time</label>
              <Input value={form.performance_time} onChange={set("performance_time")} placeholder="e.g. 9:00 PM" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Payout ($)</label>
              <Input type="number" value={form.payout_amount} onChange={set("payout_amount")} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Payout Structure</label>
              <select value={form.payout_structure} onChange={set("payout_structure")} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                {["Flat Fee", "Door Deal", "Guarantee + % of Door", "Revenue Share"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Capacity</label>
            <Input type="number" value={form.capacity} onChange={set("capacity")} placeholder="e.g. 400" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Notes</label>
            <textarea value={form.notes} onChange={set("notes")} rows={2}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            onClick={() => onSave({
              ...form,
              payout_amount: form.payout_amount ? Number(form.payout_amount) : null,
              capacity: form.capacity ? Number(form.capacity) : null,
            })}
            disabled={!form.name || !form.city || !form.performance_date}
            className="flex-1"
          >
            <Mic2 className="h-4 w-4 mr-2" />Add Show
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TourPlanner() {
  const [currentMonth, setCurrentMonth] = useState(moment().startOf("month"));
  const [venues, setVenues] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { date, task? }
  const [showModal, setShowModal] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [dragging, setDragging] = useState(null); // task being dragged
  const [routeData, setRouteData] = useState({}); // key: "fromCity|toCity" -> { distanceMiles, durationHours }
  const [routeLoading, setRouteLoading] = useState({}); // same key -> bool
  const [expenses, setExpenses] = useState([]);
  const [pinnedVenues, setPinnedVenues] = useState([]);
  const [homeBase, setHomeBase] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Venue.list("performance_date", 200),
      base44.entities.TourLogisticsTask.list("date", 500),
      base44.entities.TourExpense.list("-created_date", 200).catch(() => []),
    ]).then(([v, t, e]) => {
      setVenues(v.filter(x => x.status === "Booked" || x.status === "Performed"));
      setTasks(t);
      setExpenses(e);
      setLoading(false);
    });
  }, []);

  // Build calendar days
  const startOfCalendar = currentMonth.clone().startOf("week");
  const endOfCalendar = currentMonth.clone().endOf("month").endOf("week");
  const days = [];
  let cur = startOfCalendar.clone();
  while (cur.isSameOrBefore(endOfCalendar)) {
    days.push(cur.format("YYYY-MM-DD"));
    cur.add(1, "day");
  }

  // Map shows by date (venues with performance_date + Booked/Performed)
  const showsByDate = {};
  venues.forEach(v => {
    if (!v.performance_date) return;
    const d = moment(v.performance_date).format("YYYY-MM-DD");
    if (!showsByDate[d]) showsByDate[d] = [];
    showsByDate[d].push(v);
  });

  // Sorted show dates for travel gap calculation
  const sortedShowDates = Object.keys(showsByDate).sort();
  const travelGapsByDate = {};
  for (let i = 1; i < sortedShowDates.length; i++) {
    const prev = sortedShowDates[i - 1];
    const curr = sortedShowDates[i];
    const dayAfterPrev = moment(prev).add(1, "day").format("YYYY-MM-DD");
    const fromVenue = showsByDate[prev][0];
    const toVenue = showsByDate[curr][0];
    if (fromVenue.city !== toVenue.city) {
      travelGapsByDate[dayAfterPrev] = { from: fromVenue, to: toVenue };
    }
  }

  // Fetch driving routes for all unique travel gaps
  useEffect(() => {
    const gaps = Object.values(travelGapsByDate);
    gaps.forEach(({ from, to }) => {
      const key = `${from.city},${from.state}|${to.city},${to.state}`;
      if (routeData[key] !== undefined || routeLoading[key]) return;
      setRouteLoading(prev => ({ ...prev, [key]: true }));
      getDrivingRoute(from.city, from.state, to.city, to.state).then(result => {
        setRouteData(prev => ({ ...prev, [key]: result }));
        setRouteLoading(prev => ({ ...prev, [key]: false }));
      });
    });
  }, [JSON.stringify(Object.keys(travelGapsByDate))]);

  // Tasks by date
  const tasksByDate = {};
  tasks.forEach(t => {
    if (!tasksByDate[t.date]) tasksByDate[t.date] = [];
    tasksByDate[t.date].push(t);
  });

  // ── CRUD ──
  const handleSaveTask = async (data) => {
    if (modal.task) {
      const updated = await base44.entities.TourLogisticsTask.update(modal.task.id, data);
      setTasks(prev => prev.map(t => t.id === modal.task.id ? updated : t));
    } else {
      const created = await base44.entities.TourLogisticsTask.create(data);
      setTasks(prev => [...prev, created]);
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    await base44.entities.TourLogisticsTask.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveShow = async (data) => {
    const created = await base44.entities.Venue.create(data);
    setVenues(prev => [...prev, created]);
    setShowModal(false);
  };

  const handleUpdateShow = async (data) => {
    const updated = await base44.entities.Venue.update(editingShow.id, {
      ...data,
      payout_amount: data.payout_amount ? Number(data.payout_amount) : null,
      capacity: data.capacity ? Number(data.capacity) : null,
    });
    setVenues(prev => prev.map(v => v.id === editingShow.id ? updated : v));
    setEditingShow(null);
  };

  const handleDeleteShow = async (id) => {
    await base44.entities.Venue.delete(id);
    setVenues(prev => prev.filter(v => v.id !== id));
    setEditingShow(null);
  };

  const handleToggleDone = async (task) => {
    const newStatus = task.status === "Done" ? "Todo" : "Done";
    const updated = await base44.entities.TourLogisticsTask.update(task.id, { status: newStatus });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
  };

  // ── Drag-and-drop ──
  const handleDrop = async (targetDate) => {
    if (!dragging || dragging.date === targetDate) return;
    const updated = await base44.entities.TourLogisticsTask.update(dragging.id, { date: targetDate });
    setTasks(prev => prev.map(t => t.id === dragging.id ? { ...t, date: targetDate } : t));
    setDragging(null);
  };

  // Summary stats
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "Done").length;
  const bookedVenues = venues.filter(v => v.status === "Booked" || v.status === "Performed");
  const totalCost = tasks.reduce((sum, t) => sum + (t.cost || 0), 0);

  const today = moment().format("YYYY-MM-DD");

  const handlePinVenue = (venue) => {
    if (!pinnedVenues.find((v) => v.city === venue.city && v.state === venue.state)) {
      setPinnedVenues((prev) => [...prev, venue]);
    }
  };

  const handleRemovePin = (venue) => {
    setPinnedVenues((prev) => prev.filter((v) => !(v.city === venue.city && v.state === venue.state)));
    if (homeBase?.city === venue.city && homeBase?.state === venue.state) {
      setHomeBase(null);
    }
  };

  const handleSetHomeBase = (venue) => {
    setHomeBase(venue);
  };

  // Calculate efficient routing suggestions
  const suggestedRoutes = homeBase && pinnedVenues.length > 1
    ? pinnedVenues
        .map((v) => {
          const distance = Math.round(
            3959 *
              (2 *
                Math.asin(
                  Math.sqrt(
                    Math.sin(((homeBase.coords[0] - v.coords[0]) * Math.PI) / 180 / 2) ** 2 +
                      Math.cos((homeBase.coords[0] * Math.PI) / 180) *
                        Math.cos((v.coords[0] * Math.PI) / 180) *
                        Math.sin(((homeBase.coords[1] - v.coords[1]) * Math.PI) / 180 / 2) ** 2
                  )
                ))
          );
          return { venue: v, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5)
        .map((item, idx) => ({
          route: [homeBase.city, item.venue.city, homeBase.city],
          totalDistance: item.distance * 2,
          estimatedSavings: Math.round(item.distance * 2 * 0.15), // Estimate at $0.15/mi
        }))
    : [];

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      {modal && (
        <TaskModal
          task={modal.task}
          date={modal.date}
          prefill={modal.prefill}
          venues={bookedVenues}
          onSave={handleSaveTask}
          onClose={() => setModal(null)}
        />
      )}
      {showModal && (
        <AddShowModal
          onSave={handleSaveShow}
          onClose={() => setShowModal(false)}
        />
      )}
      {editingShow && (
        <EditShowModal
          venue={editingShow}
          onSave={handleUpdateShow}
          onDelete={handleDeleteShow}
          onClose={() => setEditingShow(null)}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Touring</p>
            <h1 className="font-heading text-4xl font-bold">Tour Planner</h1>
            <p className="text-muted-foreground text-sm mt-1">Drag tasks between days, track travel gaps, and manage logistics.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ExportTourPDF
              venues={venues}
              tasks={tasks}
              routeData={routeData}
              travelGapsByDate={travelGapsByDate}
            />
            <Button variant="outline" onClick={() => setShowModal(true)} className="gap-2 shrink-0">
              <Mic2 className="h-4 w-4" />Add Show
            </Button>
            <Button onClick={() => setModal({ date: today })} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />Add Task
            </Button>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Confirmed Shows", value: bookedVenues.length, icon: Mic2, color: "text-primary" },
            { label: "Tasks", value: `${doneTasks}/${totalTasks}`, icon: Check, color: "text-chart-5" },
            { label: "Travel Days", value: Object.keys(travelGapsByDate).length, icon: ArrowRight, color: "text-orange-400" },
            { label: "Logistics Cost", value: `$${totalCost.toFixed(0)}`, icon: DollarSign, color: "text-yellow-400" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
                <Icon className={`h-5 w-5 ${s.color} shrink-0`} />
                <div>
                  <p className={`font-heading font-bold text-xl ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Month navigator */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentMonth(m => m.clone().subtract(1, "month"))}
            className="h-9 w-9 rounded-lg border border-border hover:bg-secondary flex items-center justify-center transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-heading font-bold text-xl">{currentMonth.format("MMMM YYYY")}</h2>
          <button onClick={() => setCurrentMonth(m => m.clone().add(1, "month"))}
            className="h-9 w-9 rounded-lg border border-border hover:bg-secondary flex items-center justify-center transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Venue pinning panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Tour route map with conflict detection */}
            <TourRouteMap
              venues={venues}
              routeData={routeData}
              travelGapsByDate={travelGapsByDate}
              pinnedVenues={pinnedVenues}
              homeBase={homeBase}
            />
          </div>
          <VenuePinningPanel
            pinnedVenues={pinnedVenues}
            homeBase={homeBase}
            onPinVenue={handlePinVenue}
            onRemovePin={handleRemovePin}
            onSetHomeBase={handleSetHomeBase}
            suggestedVenues={suggestedRoutes}
          />
        </div>

        {/* Travel warnings panel */}
        {Object.values(travelGapsByDate).some(({ from, to }) => {
          const key = `${from.city},${from.state}|${to.city},${to.state}`;
          const r = routeData[key];
          return r && (r.durationHours > 8 || r.distanceMiles > 500);
        }) && (
          <div className="rounded-2xl bg-yellow-500/10 border border-yellow-500/30 p-4 space-y-2">
            <p className="text-xs font-semibold text-yellow-500 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5" />Long-Haul Travel Warnings
            </p>
            {Object.entries(travelGapsByDate).map(([date, { from, to }]) => {
              const key = `${from.city},${from.state}|${to.city},${to.state}`;
              const r = routeData[key];
              if (!r || (r.durationHours <= 8 && r.distanceMiles <= 500)) return null;
              const hrs = Math.floor(r.durationHours);
              const mins = Math.round((r.durationHours - hrs) * 60);
              const durStr = mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
              return (
                <div key={date} className="flex items-center gap-2 text-xs text-yellow-600">
                  <span className="text-muted-foreground w-16 shrink-0">{moment(date).format("MMM D")}</span>
                  <span>{from.city} → {to.city}</span>
                  <span className="ml-auto font-semibold">{r.distanceMiles} mi · {durStr}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Hotel Estimator */}
        {(() => {
          // Build travelGaps array with fromDate/toDate for HotelEstimator
          const gaps = [];
          for (let i = 1; i < sortedShowDates.length; i++) {
            const prev = sortedShowDates[i - 1];
            const curr = sortedShowDates[i];
            const from = showsByDate[prev][0];
            const to = showsByDate[curr][0];
            if (from.city !== to.city) {
              gaps.push({ fromDate: prev, toDate: curr, from, to });
            }
          }
          return gaps.length > 0 ? (
            <HotelEstimator
              travelGaps={gaps}
              tasks={tasks}
              onAddTask={(prefill) => setModal({ date: prefill.date, task: null, prefill })}
            />
          ) : null;
        })()}

        {/* Tour Analytics Dashboard */}
        <TourAnalyticsDashboard
          venues={venues}
          tasks={tasks}
          expenses={expenses}
          routeData={routeData}
        />

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary"><Mic2 className="h-3 w-3" />Confirmed Show</span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400"><ArrowRight className="h-3 w-3" />Travel Gap</span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"><AlertTriangle className="h-3 w-3" />Long Haul (&gt;8h)</span>
          {Object.entries(CATEGORIES).slice(0, 4).map(([name, cfg]) => {
            const Icon = cfg.icon;
            return <span key={name} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.border} ${cfg.color}`}><Icon className="h-3 w-3" />{name}</span>;
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1.5 group">
              {days.map(dateStr => (
                <DayCell
                 key={dateStr}
                 dateStr={dateStr}
                 isCurrentMonth={moment(dateStr).month() === currentMonth.month()}
                 isToday={dateStr === today}
                 shows={showsByDate[dateStr] || []}
                 travelGap={travelGapsByDate[dateStr] || null}
                 travelRoute={(() => {
                   const gap = travelGapsByDate[dateStr];
                   if (!gap) return null;
                   const key = `${gap.from.city},${gap.from.state}|${gap.to.city},${gap.to.state}`;
                   return routeData[key] || null;
                 })()}
                 travelLoading={(() => {
                   const gap = travelGapsByDate[dateStr];
                   if (!gap) return false;
                   const key = `${gap.from.city},${gap.from.state}|${gap.to.city},${gap.to.state}`;
                   return !!routeLoading[key];
                 })()}
                 tasks={tasksByDate[dateStr] || []}
                 onAddTask={(d) => setModal({ date: d })}
                 onEditTask={(task) => setModal({ date: task.date, task })}
                 onDeleteTask={handleDelete}
                 onToggleDone={handleToggleDone}
                 onDragStart={setDragging}
                 onDragOver={() => {}}
                 onDrop={handleDrop}
                 onEditShow={setEditingShow}
                 />
              ))}
            </div>
          </>
        )}

        {/* Category key */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Task Categories</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(CATEGORIES).map(([name, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button key={name} onClick={() => setModal({ date: today })}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border hover:opacity-80 transition-opacity ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                  <Icon className="h-3.5 w-3.5 shrink-0" />{name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}