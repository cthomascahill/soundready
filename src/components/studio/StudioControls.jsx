import { Input } from "@/components/ui/input";

const MOODS = ["Hype", "Melancholy", "Aggressive", "Romantic", "Motivational", "Dark", "Playful", "Spiritual", "Nostalgic", "Confident"];
const KEYS = ["C Major","C Minor","C# Major","C# Minor","D Major","D Minor","Eb Major","Eb Minor","E Major","E Minor","F Major","F Minor","F# Major","F# Minor","G Major","G Minor","Ab Major","Ab Minor","A Major","A Minor","Bb Major","Bb Minor","B Major","B Minor"];
const GENRES = ["Hip-Hop","R&B","Pop","Trap","Drill","Afrobeats","Country","Rock","Gospel","Latin","Indie","Other"];
const SECTIONS = ["Verse","Hook/Chorus","Pre-Chorus","Bridge","Intro","Outro","Freestyle"];
const SCHEMES = ["AABB","ABAB","ABCB","Internal Rhymes","No Preference"];

function bpmLabel(bpm) {
  if (bpm < 80) return "Slow";
  if (bpm < 100) return "Mid-Slow";
  if (bpm < 120) return "Mid-Tempo";
  if (bpm < 140) return "Up-Tempo";
  if (bpm < 160) return "Fast";
  return "Very Fast";
}

export default function StudioControls({ params, setParams, inputs, setInputs }) {
  const update = (field, val) => setParams(p => ({ ...p, [field]: val }));
  const updateInput = (field, val) => setInputs(i => ({ ...i, [field]: val }));
  const toggleMood = (m) => setParams(p => ({
    ...p,
    moods: p.moods.includes(m) ? p.moods.filter(x => x !== m) : [...p.moods, m]
  }));

  return (
    <div className="space-y-5">
      {/* Block 1 — Song Setup */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-primary uppercase tracking-widest">Song Setup</p>

        <Input
          placeholder="Song title (optional)"
          value={params.title}
          onChange={e => update("title", e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-primary h-9 text-sm"
        />

        {/* BPM Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400">BPM</label>
            <span className="text-xs font-mono font-bold text-primary">
              {params.bpm} <span className="text-zinc-500 font-normal">— {bpmLabel(params.bpm)}</span>
            </span>
          </div>
          <input
            type="range" min={60} max={200} value={params.bpm}
            onChange={e => update("bpm", Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-zinc-700 accent-primary cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-600">
            <span>60</span><span>120</span><span>200</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Key & Scale</label>
            <select value={params.key} onChange={e => update("key", e.target.value)}
              className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Any Key</option>
              {KEYS.map(k => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Genre</label>
            <select value={params.genre} onChange={e => update("genre", e.target.value)}
              className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Any Genre</option>
              {GENRES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Section</label>
            <select value={params.section} onChange={e => update("section", e.target.value)}
              className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary">
              {SECTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Rhyme Scheme</label>
            <select value={params.rhymeScheme} onChange={e => update("rhymeScheme", e.target.value)}
              className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary">
              {SCHEMES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Moods */}
        <div>
          <label className="text-xs text-zinc-400 mb-1.5 block">Mood / Vibe</label>
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map(m => (
              <button key={m} onClick={() => toggleMood(m)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${params.moods.includes(m) ? "bg-primary text-black border-primary" : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800" />

      {/* Block 2 — Your Input */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-primary uppercase tracking-widest">Your Input</p>

        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Seed Lyrics / Starting Line</label>
          <textarea
            value={inputs.seed}
            onChange={e => updateInput("seed", e.target.value)}
            placeholder={"Start writing anything — a line, a feeling, a concept...\n\"Started from nothing, now the city knows my name\""}
            rows={4}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono"
          />
        </div>

        <Input placeholder="Topic / Theme (e.g. loyalty, heartbreak, grinding)"
          value={inputs.topic} onChange={e => updateInput("topic", e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-primary h-9 text-sm" />

        <Input placeholder="Words to include (comma-separated)"
          value={inputs.wordsInclude} onChange={e => updateInput("wordsInclude", e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-primary h-9 text-sm" />

        <Input placeholder="Words to avoid (comma-separated)"
          value={inputs.wordsAvoid} onChange={e => updateInput("wordsAvoid", e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-primary h-9 text-sm" />

        <Input placeholder="Reference artist style (e.g. write like J. Cole)"
          value={inputs.refArtist} onChange={e => updateInput("refArtist", e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-primary h-9 text-sm" />
      </div>
    </div>
  );
}