import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { awardPoints } from "@/lib/awardPoints";
import { CheckCircle2, Tag } from "lucide-react";
import TodoForm from "@/components/todos/TodoForm";
import TodoItem from "@/components/todos/TodoItem";
import TodoPriorityBadge, { priorityOf } from "@/components/todos/TodoPriorityBadge";
import RewardsCard from "@/components/todos/RewardsCard";
import CadenceCard from "@/components/todos/CadenceCard";

// Monday of the current week (ISO date), the to-do list is a weekly list.
const mondayOfThisWeek = () => {
  const d = new Date();
  d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return d.toISOString().slice(0, 10);
};

const PRIORITIES = ["high", "medium", "low"];
const NO_CATEGORY = "__none__";
const catOf = (t) => t.category || "";

const chip = (active, label, onClick) => (
  <button
    key={label}
    onClick={onClick}
    className={`px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wide transition-colors ${
      active ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground/60 hover:text-foreground"
    }`}
  >
    {label}
  </button>
);

/**
 * "This Week", the artist's to-do list for Sam. Open items are grouped into
 * High / Medium / Low, or into the artist's own folder labels (Money, Music,
 * ...). Drag within a group to reorder, drag into another group to re-file the
 * to-do, and use the chips to filter by the other dimension.
 */
export default function Todos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState(null);
  const [groupBy, setGroupBy] = useState("priority");
  const [prioFilter, setPrioFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");

  const load = () =>
    base44.entities.ArtistTodo.list("-created_date", 200)
      .then((list) => {
        setTodos(list);
        // First visit after the reorder feature shipped: give open to-dos a
        // position following their current display order, then save it once.
        const openItems = list.filter((t) => !t.done);
        const missing = openItems.some((t) => t.sort_order == null);
        if (openItems.length && missing) {
          const updates = openItems.map((t, i) => ({ id: t.id, sort_order: i }));
          const byId = new Map(updates.map((u) => [u.id, u.sort_order]));
          setTodos((prev) => prev.map((t) => (byId.has(t.id) ? { ...t, sort_order: byId.get(t.id) } : t)));
          base44.entities.ArtistTodo.bulkUpdate(updates).catch(() => {});
        }
      })
      .catch(() => setTodos([]));

  useEffect(() => {
    if (user) load();
  }, [user]);

  const addTodo = async (title, notes, priority, category) => {
    const sameGroup = (todos || []).filter((t) => !t.done && priorityOf(t.priority) === priority);
    // New to-dos go to the top of their priority group.
    const minOrder = sameGroup.length
      ? Math.min(...sameGroup.map((t) => t.sort_order ?? 0))
      : 0;
    const created = await base44.entities.ArtistTodo.create({
      user_id: user.id,
      title,
      notes,
      priority,
      category,
      done: false,
      week_of: mondayOfThisWeek(),
      sort_order: minOrder - 1,
    });
    setTodos((prev) => [created, ...(prev || [])]);
  };

  const toggle = async (todo) => {
    const done = !todo.done;
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, done } : t)));
    await base44.entities.ArtistTodo.update(todo.id, {
      done,
      done_at: done ? new Date().toISOString() : null,
    });
    if (done) awardPoints("todo_done", todo.id, `Checked off: ${todo.title}`);
  };

  const remove = async (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await base44.entities.ArtistTodo.delete(id);
  };

  const edit = async (id, title, notes, priority, category) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, title, notes, priority, category } : t)));
    await base44.entities.ArtistTodo.update(id, { title, notes, priority, category });
  };

  const open = (todos || [])
    .filter((t) => !t.done)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const done = (todos || []).filter((t) => t.done);
  const pct = todos?.length ? Math.round((done.length / todos.length) * 100) : 0;

  // Folder labels already in use, for the suggestions and the filter chips.
  const categories = [...new Set(open.map(catOf).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const prioCount = (p) => open.filter((t) => priorityOf(t.priority) === p).length;
  const catCount = (c) => open.filter((t) => catOf(t) === c).length;

  // The chips filter by whichever dimension you're not grouping by.
  const visible = open.filter((t) =>
    groupBy === "priority"
      ? catFilter === "all" || catOf(t) === catFilter
      : prioFilter === "all" || priorityOf(t.priority) === prioFilter
  );

  // Groups on screen. Each section knows how to re-file a to-do dropped in
  // from another group (setPatch), so dragging between groups moves the item.
  let sections;
  if (groupBy === "priority") {
    sections = PRIORITIES.map((p) => ({
      id: p,
      setPatch: { priority: p },
      items: visible.filter((t) => priorityOf(t.priority) === p),
      header: <TodoPriorityBadge priority={p} />,
      empty: `Nothing ${p} priority right now.`,
    }));
  } else {
    const cats = [...new Set(visible.map(catOf))].sort((a, b) => {
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b);
    });
    sections = cats.map((c) => ({
      id: c || NO_CATEGORY,
      setPatch: { category: c },
      items: visible.filter((t) => catOf(t) === c),
      header: (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          <Tag className="h-3 w-3" />
          {c || "No folder"}
        </span>
      ),
    }));
  }

  const onDragEnd = ({ source, destination }) => {
    if (!destination) return;
    const srcSec = sections.find((s) => s.id === source.droppableId);
    const dstSec = sections.find((s) => s.id === destination.droppableId);
    if (!srcSec || !dstSec) return;
    if (source.droppableId === destination.droppableId && destination.index === source.index) return;
    const moved = srcSec.items[source.index];
    if (!moved) return;
    const rest = srcSec.items.filter((t) => t.id !== moved.id);
    const target = srcSec === dstSec ? rest : dstSec.items.filter((t) => t.id !== moved.id);
    target.splice(destination.index, 0, moved);
    const updates = target.map((t, i) => ({
      id: t.id,
      sort_order: i,
      ...(srcSec !== dstSec && t.id === moved.id ? dstSec.setPatch : {}),
    }));
    if (srcSec !== dstSec) updates.push(...rest.map((t, i) => ({ id: t.id, sort_order: i })));
    const byId = new Map(updates.map((u) => [u.id, u]));
    setTodos((prev) => prev.map((t) => (byId.has(t.id) ? { ...t, ...byId.get(t.id) } : t)));
    base44.entities.ArtistTodo.bulkUpdate(updates).catch(() => {});
  };

  const renderTodo = (t, i, handleProps) => (
    <Draggable key={t.id} draggableId={t.id} index={i}>
      {(dragProvided) => (
        <div ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
          <TodoItem
            todo={t}
            onToggle={toggle}
            onDelete={remove}
            onEdit={edit}
            handleProps={dragProvided.dragHandleProps}
            categories={categories}
          />
        </div>
      )}
    </Draggable>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">This Week</p>
        <h1 className="font-heading text-4xl font-bold">Tell Sam what needs to get done</h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Load up your week here. Sam emails you what's left until it's all checked off, as
          often as you want, and every box you tick earns SoundReady Points.
        </p>
      </div>

      {todos !== null && todos.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs font-semibold text-muted-foreground shrink-0">
            {done.length}/{todos.length} done this week
          </p>
        </div>
      )}

      <TodoForm onAdd={addTodo} categories={categories} />

      {todos === null ? (
        <div className="h-24 rounded-xl bg-card border border-border animate-pulse" />
      ) : (
        <div className="space-y-5">
          {todos.length === 0 && (
            <div className="rounded-2xl bg-card border border-dashed border-border p-10 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/30 mx-auto" />
              <p className="font-semibold">Nothing on the list yet</p>
              <p className="text-sm text-muted-foreground">
                Add what this week needs, bookings to chase, songs to finish, emails to send.
              </p>
            </div>
          )}
          {todos.length > 0 && (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Group by</span>
                {chip(groupBy === "priority", "Priority", () => setGroupBy("priority"))}
                {chip(groupBy === "category", "Folder", () => setGroupBy("category"))}
              </div>
              {groupBy === "priority" && categories.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Show</span>
                  {chip(catFilter === "all", `All (${open.length})`, () => setCatFilter("all"))}
                  {categories.map((c) =>
                    chip(catFilter === c, `${c} (${catCount(c)})`, () => setCatFilter(catFilter === c ? "all" : c))
                  )}
                </div>
              )}
              {groupBy === "category" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Show</span>
                  {chip(prioFilter === "all", `All (${open.length})`, () => setPrioFilter("all"))}
                  {PRIORITIES.map((p) =>
                    chip(prioFilter === p, `${p} (${prioCount(p)})`, () => setPrioFilter(prioFilter === p ? "all" : p))
                  )}
                </div>
              )}

              <DragDropContext onDragEnd={onDragEnd}>
                {sections.map((sec) => (
                  <div key={sec.id} className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      {sec.header}
                      <div className="flex-1 h-px bg-border" />
                      <p className="text-[11px] font-semibold text-muted-foreground/60">
                        {sec.items.length === 1 ? "1 task" : `${sec.items.length} tasks`}
                      </p>
                    </div>
                    {sec.items.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground/60">
                        {sec.empty || "Nothing here yet."}
                      </p>
                    ) : (
                      <Droppable droppableId={sec.id}>
                        {(dropProvided) => (
                          <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="space-y-2.5">
                            {sec.items.map((t, i) => renderTodo(t, i))}
                            {dropProvided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    )}
                  </div>
                ))}
              </DragDropContext>
              {sections.length === 0 && open.length > 0 && (
                <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground/60">
                  No to-dos match that filter.
                </p>
              )}

              {done.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    Checked off
                  </p>
                  {done.map((t) => (
                    <TodoItem
                      key={t.id}
                      todo={t}
                      onToggle={toggle}
                      onDelete={remove}
                      onEdit={edit}
                      categories={categories}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <CadenceCard />
      <RewardsCard />
    </div>
  );
}