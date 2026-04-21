import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Plus, Trash2, Layout, Users, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import moment from "moment";

export default function Whiteboard() {
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const data = await base44.entities.Whiteboard.filter({ owner_email: u.email }, "-created_date", 50);
      setBoards(data);
      setLoading(false);
    });
  }, []);

  const createBoard = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const board = await base44.entities.Whiteboard.create({
      name: newName.trim(),
      owner_email: user.email,
      collaborators: [],
      share_link_enabled: false,
    });
    setBoards((prev) => [board, ...prev]);
    setNewName("");
    setShowNew(false);
    setCreating(false);
    window.location.href = `/whiteboard/${board.id}`;
  };

  const deleteBoard = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    await base44.entities.Whiteboard.delete(id);
    setBoards((prev) => prev.filter((b) => b.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Collaborative</p>
            <h1 className="font-heading text-4xl font-bold">Whiteboard</h1>
            <p className="text-muted-foreground mt-1">Open canvas for ideas, plans, and team brainstorming.</p>
          </div>
          <Button className="gap-2" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" /> New Board
          </Button>
        </motion.div>

        {showNew && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <p className="font-semibold">Name your board</p>
            <div className="flex gap-3">
              <Input
                placeholder="e.g. Album rollout ideas, Tour planning..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createBoard()}
                autoFocus
                className="flex-1"
              />
              <Button onClick={createBoard} disabled={creating || !newName.trim()}>
                {creating ? "Creating..." : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}

        {boards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-20 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <Layout className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-heading font-bold text-xl">No boards yet</p>
              <p className="text-muted-foreground text-sm mt-1">Create your first whiteboard to start collaborating.</p>
            </div>
            <Button className="gap-2" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4" /> Create Board
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board, i) => (
              <motion.div key={board.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/whiteboard/${board.id}`}>
                  <div className="rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group cursor-pointer overflow-hidden">
                    {/* Board preview area */}
                    <div className="h-32 bg-gradient-to-br from-secondary/60 to-background relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: `radial-gradient(circle at 30% 50%, hsl(var(--primary)) 0%, transparent 60%)` }} />
                      <div className="absolute bottom-3 left-3 flex gap-1.5">
                        {[40, 70, 55, 80].map((w, j) => (
                          <div key={j} className="h-1.5 rounded-full bg-white/20" style={{ width: w }} />
                        ))}
                      </div>
                      <Layout className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-white/10" />
                    </div>
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{board.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {moment(board.updated_date || board.created_date).fromNow()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => deleteBoard(board.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}