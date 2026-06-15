import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import StudioControls from "@/components/studio/StudioControls";
import StudioTools from "@/components/studio/StudioTools";
import StudioOutput from "@/components/studio/StudioOutput";
import RhymeBank from "@/components/studio/RhymeBank";
import IdeasBoard from "@/components/studio/IdeasBoard";
import WaveformBg from "@/components/studio/WaveformBg";

const TABS = ["Write", "Rhyme Bank", "Ideas Board"];

function buildPromptContext(params, inputs, artistProfile) {
  const ap = artistProfile;
  const apContext = ap ? `
ARTIST PROFILE (use to personalize output):
- Artist: ${ap.stage_name || "Unknown"}
- Genre: ${(ap.genres || []).join(", ") || "Not specified"}
- Vibe: ${ap.subgenre_vibe || "Not specified"}
- Sounds like: ${[ap.sounds_like_1, ap.sounds_like_2, ap.sounds_like_3].filter(Boolean).join(", ") || "Not specified"}
- Career stage: ${ap.career_stage || "Not specified"}
- Goal: ${ap.primary_goal || "Not specified"}
` : "";

  return `
${apContext}

SESSION PARAMETERS:
- BPM: ${params.bpm} (${params.bpm < 80 ? "Slow" : params.bpm < 120 ? "Mid-Tempo" : params.bpm < 150 ? "Up-Tempo" : "Fast"})
- Key: ${params.key || "Not specified"}
- Genre: ${params.genre || "Not specified"}
- Mood/Vibe: ${params.moods.join(", ") || "Not specified"}
- Section: ${params.section}
- Rhyme Scheme: ${params.rhymeScheme}
- Song Title: ${params.title || "Untitled"}

ARTIST INPUT:
- Seed Lyrics / Starting Line: ${inputs.seed || "None"}
- Topic / Theme: ${inputs.topic || "Not specified"}
- Words to include: ${inputs.wordsInclude || "None"}
- Words to avoid: ${inputs.wordsAvoid || "None"}
- Reference artist style: ${inputs.refArtist || "None"}

IMPORTANT: Your output must feel like it came from a real, talented songwriter — not an AI. Be vivid, specific, and use natural language. Respect the BPM when thinking about syllable density.
`.trim();
}

const TOOL_PROMPTS = {
  write: (ctx) => `You are a top-tier ghostwriter. Write a full ${ctx.section || "Verse"} (16 bars minimum) based on this context:\n\n${ctx.context}\n\nWrite ONLY the lyrics — no explanations, no labels, just the bars.`,
  rewrite: (ctx) => `You are a ghostwriter known for making lyrics hit harder. Take these seed lyrics and rewrite them with more punch, better rhymes, stronger imagery, and improved flow:\n\n${ctx.seed}\n\nFull session context:\n${ctx.context}\n\nOutput ONLY the rewritten lyrics.`,
  rhymes: (ctx) => `Find rhymes for the last word or phrase in: "${ctx.seed || ctx.topic}"\n\n${ctx.context}\n\nReturn: 6 perfect rhymes, 6 slant rhymes, 4 multisyllabic options, and 3 full line endings that use those sounds naturally. Label each group.`,
  hook: (ctx) => `Write 5 distinct hook/chorus options based on this context:\n\n${ctx.context}\n\nLabel each "Hook Option 1", "Hook Option 2" etc. Each hook should be 4–8 lines, catchy, memorable, and singable. Vary the energy and approach across the 5 options.`,
  expand: (ctx) => `Take this concept and expand it into a full 16-bar verse with a story arc:\n\nConcept: ${ctx.seed || ctx.topic}\n\n${ctx.context}\n\nBuild it out — opening, rising tension, peak moment, landing. Output ONLY the verse.`,
  syllable: (ctx) => `Count the syllables for each WORD in these lyrics, then give the total count per line:\n\n"${ctx.seed}"\n\nFormat: list each line, then each word with its syllable count in parentheses, then the line total. Also note if the total syllable density fits ${ctx.bpm} BPM.`,
  flow: (ctx) => `Suggest a detailed rhythmic delivery pattern for a ${ctx.section} at ${ctx.bpm} BPM in ${ctx.genre || "hip-hop"} style.\n\nContext:\n${ctx.context}\n\nDescribe: where to ride the beat, where to syncopate, where to breathe, double-time moments, and how to land the last word of each bar. Be specific — like a real producer or rap coach explaining to an artist.`,
  title: (ctx) => `Generate 10 potential song title options based on this context:\n\n${ctx.context}\n\nMake them memorable, marketable, and fitting for the genre/mood. Mix different styles: cryptic, direct, emotional, clever. Number them 1–10.`,
  punchup: (ctx) => `Take these lyrics and punch them up — make every line more vivid, specific, and impactful. Replace generic phrases with concrete imagery. Make weak rhymes stronger:\n\n${ctx.seed}\n\nContext:\n${ctx.context}\n\nOutput the punched-up version only, then briefly note what you changed.`,
  translate: (ctx) => `Take these lyrics and rewrite them in a completely different genre style while keeping the core theme and emotion:\n\nOriginal:\n${ctx.seed}\n\nContext:\n${ctx.context}\n\nSuggest 2 genre translations (e.g. rap → R&B hook, R&B → country, etc.) and rewrite accordingly. Label each clearly.`,
};

export default function Studio() {
  const { user } = useAuth();
  const [tab, setTab] = useState("Write");
  const [params, setParams] = useState({
    title: "", bpm: 90, key: "", genre: "", section: "Verse",
    rhymeScheme: "No Preference", moods: [],
  });
  const [inputs, setInputs] = useState({
    seed: "", topic: "", wordsInclude: "", wordsAvoid: "", refArtist: "",
  });
  const [outputBlocks, setOutputBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [artistProfile, setArtistProfile] = useState(null);
  const [trackerSongs, setTrackerSongs] = useState([]);
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.ArtistProfile.filter({ created_by_id: user.id }, "-created_date", 1).catch(() => []),
      base44.entities.PipelineSong.filter({ created_by_id: user.id }, "sort_order", 50).catch(() => []),
    ]).then(([profiles, songs]) => {
      if (profiles.length > 0) setArtistProfile(profiles[0]);
      else setProfileMissing(true);
      setTrackerSongs(songs);
    });
  }, [user]);

  const runTool = async (toolId) => {
    setActiveTool(toolId);
    setLoading(true);
    setTab("Write");

    const ctx = {
      ...params,
      ...inputs,
      context: buildPromptContext(params, inputs, artistProfile),
    };

    const promptFn = TOOL_PROMPTS[toolId];
    const prompt = promptFn(ctx);

    const toolLabels = {
      write: `${params.section} — ${params.title || "Untitled"}`,
      rewrite: "Rewritten Lyrics",
      rhymes: `Rhyme Bank — "${inputs.seed?.split(/\s+/).pop() || inputs.topic}"`,
      hook: "Hook Options",
      expand: "Expanded Verse",
      syllable: "Syllable Count",
      flow: "Flow Pattern",
      title: "Title Options",
      punchup: "Punched-Up Lyrics",
      translate: "Vibe Translation",
    };

    const result = await base44.integrations.Core.InvokeLLM({ prompt });

    const newBlock = {
      id: Date.now(),
      label: toolLabels[toolId],
      content: typeof result === "string" ? result : result?.text || JSON.stringify(result),
      tool: toolId,
    };

    setOutputBlocks(prev => [...prev, newBlock]);
    setLoading(false);
    setActiveTool(null);
  };

  const saveToIdeas = (block) => {
    const tag = block.tool === "hook" ? "Hook" : block.tool === "title" ? "Title" : block.tool === "write" || block.tool === "rewrite" ? "Verse" : "Idea";
    setIdeas(prev => [{ id: Date.now(), content: block.content, tag, savedAt: new Date().toISOString(), label: block.label }, ...prev]);
  };

  const addToTracker = async (idea) => {
    const newSong = await base44.entities.PipelineSong.create({
      song_name: idea.label || "New Song from Studio",
      notes: idea.content.slice(0, 500),
      sort_order: trackerSongs.length,
    });
    setTrackerSongs(prev => [...prev, newSong]);
    alert(`"${newSong.song_name}" added to your Song Tracker!`);
  };

  const copyToSeed = (content) => {
    setInputs(i => ({ ...i, seed: content.slice(0, 400) }));
    setTab("Write");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Ambient waveform background */}
      <div className="absolute inset-0 pointer-events-none">
        <WaveformBg bpm={params.bpm} />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-zinc-800/60 px-4 sm:px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-bold">Creative Workspace</p>
            <h1 className="font-heading text-2xl font-bold">The Studio</h1>
          </div>
          <div className="flex items-center gap-3">
            {profileMissing && (
              <Link to="/artist-profile" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900/60 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-all">
                ✦ Complete your Artist Profile for personalized outputs →
              </Link>
            )}
            {/* Tab switcher */}
            <div className="flex rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${tab === t ? "bg-primary text-black" : "text-zinc-400 hover:text-white"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">

        {tab === "Write" && (
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-130px)]">
            {/* Left Panel */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 overflow-y-auto space-y-5 pr-1">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm p-5">
                <StudioControls params={params} setParams={setParams} inputs={inputs} setInputs={setInputs} />
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm p-5">
                <StudioTools onTool={runTool} loading={loading} activeTool={activeTool} />
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-5 overflow-hidden flex flex-col">
              <StudioOutput
                blocks={outputBlocks}
                onClear={() => setOutputBlocks([])}
                onSave={saveToIdeas}
                onCopyToSeed={copyToSeed}
                loading={loading}
                activeTool={activeTool}
              />
            </div>
          </div>
        )}

        {tab === "Rhyme Bank" && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm p-6">
            <RhymeBank onSelectRhyme={(r) => { setInputs(i => ({ ...i, seed: i.seed ? `${i.seed} ${r}` : r })); setTab("Write"); }} />
          </div>
        )}

        {tab === "Ideas Board" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">{ideas.length} saved idea{ideas.length !== 1 ? "s" : ""}</p>
            </div>
            <IdeasBoard
              ideas={ideas}
              setIdeas={setIdeas}
              trackerSongs={trackerSongs}
              onAddToTracker={addToTracker}
            />
          </div>
        )}
      </div>
    </div>
  );
}