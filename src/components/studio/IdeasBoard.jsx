import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import moment from "moment";

const TAGS = ["Hook", "Verse", "Title", "Idea", "Line"];
const TAG_COLORS = {
  Hook: "bg-primary/15 text-primary border-primary/25",
  Verse: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  Title: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  Idea: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  Line: "bg-zinc-600/30 text-zinc-400 border-zinc-600/30",
};

export default function IdeasBoard({ ideas, setIdeas, trackerSongs, onAddToTracker }) {
  const [editingTag, setEditingTag] = useState(null);

  const remove = (id) => setIdeas(prev => prev.filter(i => i.id !== id));

  const updateTag = (id, tag) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, tag } : i));
    setEditingTag(null);
  };

  if (ideas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
        <p className="text-zinc-500 text-sm">No saved ideas yet</p>
        <p className="text-zinc-600 text-xs mt-1">Click "Save to Ideas Board" on any output</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {ideas.map(idea => (
        <div key={idea.id} className="rounded-xl border border-zinc-700 bg-zinc-900/90 p-4 space-y-3 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            {editingTag === idea.id ? (
              <div className="flex flex-wrap gap-1">
                {TAGS.map(t => (
                  <button key={t} onClick={() => updateTag(idea.id, t)}
                    className={`px-2 py-0.5 rounded-full text-[10px] border font-medium ${TAG_COLORS[t]}`}>
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <button onClick={() => setEditingTag(idea.id)}
                className={`px-2 py-0.5 rounded-full text-[10px] border font-medium ${TAG_COLORS[idea.tag] || TAG_COLORS.Idea}`}>
                {idea.tag || "Idea"}
              </button>
            )}
            <button onClick={() => remove(idea.id)} className="text-zinc-600 hover:text-red-400 transition-colors shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="text-sm text-zinc-200 font-mono leading-relaxed flex-1 whitespace-pre-wrap">{idea.content.slice(0, 200)}{idea.content.length > 200 ? "…" : ""}</p>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-zinc-600">{moment(idea.savedAt).fromNow()}</p>
            <button
              onClick={() => onAddToTracker(idea)}
              className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-primary transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Add to Tracker
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}