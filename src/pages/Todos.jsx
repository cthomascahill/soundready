import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { awardPoints } from "@/lib/awardPoints";
import { CheckCircle2 } from "lucide-react";
import TodoForm from "@/components/todos/TodoForm";
import TodoItem from "@/components/todos/TodoItem";
import RewardsCard from "@/components/todos/RewardsCard";
import CadenceCard from "@/components/todos/CadenceCard";

// Monday of the current week (ISO date) — the to-do list is a weekly list.
const mondayOfThisWeek = () => {
  const d = new Date();
  d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return d.toISOString().slice(0, 10);
};

/**
 * "This Week" — the artist's to-do list for Sam. Everything added here goes
 * into Sam's daily morning reminder email until it's checked off. Open items
 * can be dragged up and down, and the order is what Sam's email uses too.
 */
export default function Todos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState(null);

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

  const addTodo = async (title, notes) => {
    const openItems = (todos || []).filter((t) => !t.done);
    // New to-dos go to the top of the list, like they always did.
    const minOrder = openItems.length
      ? Math.min(...openItems.map((t) => t.sort_order ?? 0))
      : 0;
    const created = await base44.entities.ArtistTodo.create({
      user_id: user.id,
      title,
      notes,
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

  const open = (todos || [])
    .filter((t) => !t.done)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const done = (todos || []).filter((t) => t.done);
  const pct = todos?.length ? Math.round((done.length / todos.length) * 100) : 0;

  const onDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;
    const reordered = [...open];
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    const updates = reordered.map((t, i) => ({ id: t.id, sort_order: i }));
    const byId = new Map(updates.map((u) => [u.id, u.sort_order]));
    setTodos((prev) => prev.map((t) => (byId.has(t.id) ? { ...t, sort_order: byId.get(t.id) } : t)));
    base44.entities.ArtistTodo.bulkUpdate(updates).catch(() => {});
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">This Week</p>
        <h1 className="font-heading text-4xl font-bold">Tell Sam what needs to get done</h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Load up your week here. Sam emails you what's left until it's all checked off — as
          often as you want — and every box you tick earns SoundReady Points.
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

      <TodoForm onAdd={addTodo} />

      {todos === null ? (
        <div className="h-24 rounded-xl bg-card border border-border animate-pulse" />
      ) : (
        <div className="space-y-2.5">
          {todos.length === 0 && (
            <div className="rounded-2xl bg-card border border-dashed border-border p-10 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/30 mx-auto" />
              <p className="font-semibold">Nothing on the list yet</p>
              <p className="text-sm text-muted-foreground">
                Add what this week needs — bookings to chase, songs to finish, emails to send.
              </p>
            </div>
          )}
          {open.length > 0 && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="open-todos">
                {(dropProvided) => (
                  <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="space-y-2.5">
                    {open.map((t, i) => (
                      <Draggable key={t.id} draggableId={t.id} index={i}>
                        {(dragProvided) => (
                          <div ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                            <TodoItem
                              todo={t}
                              onToggle={toggle}
                              onDelete={remove}
                              handleProps={dragProvided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {dropProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
          {done.length > 0 && (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 pt-2">
                Checked off
              </p>
              {done.map((t) => (
                <TodoItem key={t.id} todo={t} onToggle={toggle} onDelete={remove} />
              ))}
            </>
          )}
        </div>
      )}

      <CadenceCard />
      <RewardsCard />
    </div>
  );
}