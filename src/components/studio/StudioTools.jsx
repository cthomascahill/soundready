const TOOLS = [
  { id: "write",     emoji: "🎤", label: "Write My Lyrics" },
  { id: "rewrite",  emoji: "🔁", label: "Rewrite This" },
  { id: "rhymes",   emoji: "🎯", label: "Find Rhymes" },
  { id: "hook",     emoji: "💡", label: "Give Me a Hook" },
  { id: "expand",   emoji: "🧠", label: "Expand This Idea" },
  { id: "syllable", emoji: "🔤", label: "Syllable Counter" },
  { id: "flow",     emoji: "🎵", label: "Suggest a Flow Pattern" },
  { id: "title",    emoji: "🪝", label: "Give Me a Title" },
  { id: "punchup",  emoji: "🗣️", label: "Punch Up My Lines" },
  { id: "translate",emoji: "🌍", label: "Translate the Vibe" },
];

export default function StudioTools({ onTool, loading, activeTool }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Tools</p>
      <div className="grid grid-cols-2 gap-2">
        {TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => onTool(t.id)}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
              activeTool === t.id && loading
                ? "bg-primary/20 border-primary text-primary"
                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary/50 hover:text-white hover:bg-zinc-800"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <span className="text-base shrink-0">{t.emoji}</span>
            <span className="text-xs leading-tight">{t.label}</span>
            {activeTool === t.id && loading && (
              <div className="ml-auto h-3 w-3 border border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}