import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RhymeBank({ onSelectRhyme }) {
  const [word, setWord] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!word.trim()) return;
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a comprehensive rhyme bank for the word "${word.trim()}" for songwriting purposes.
      
Return a JSON object with these keys:
- perfect: array of 8-10 perfect rhymes
- slant: array of 8-10 slant/near rhymes  
- multisyllabic: array of 6-8 multisyllabic rhymes (phrases that rhyme and match the syllable count)
- last_syllable: array of 6-8 words that rhyme only on the last syllable
- phrases: array of 5-6 natural phrases that end on that sound (usable as line endings)

Make them useful for actual songwriting — not just dictionary words. Include slang and phrases that feel natural in music.`,
      response_json_schema: {
        type: "object",
        properties: {
          perfect: { type: "array", items: { type: "string" } },
          slant: { type: "array", items: { type: "string" } },
          multisyllabic: { type: "array", items: { type: "string" } },
          last_syllable: { type: "array", items: { type: "string" } },
          phrases: { type: "array", items: { type: "string" } },
        }
      }
    });
    setResults(res);
    setLoading(false);
  };

  const COLUMNS = [
    { key: "perfect", label: "Perfect Rhymes" },
    { key: "slant", label: "Slant / Near" },
    { key: "multisyllabic", label: "Multisyllabic" },
    { key: "last_syllable", label: "Last Syllable" },
    { key: "phrases", label: "Natural Phrases" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-primary uppercase tracking-widest">Rhyme Bank</p>
      <div className="flex gap-2">
        <Input
          placeholder='Type a word (e.g. "fire")'
          value={word}
          onChange={e => setWord(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-primary"
        />
        <Button onClick={search} disabled={loading || !word.trim()} className="shrink-0">
          {loading ? <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : "Find"}
        </Button>
      </div>

      {results && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COLUMNS.map(col => (
            results[col.key]?.length > 0 && (
              <div key={col.key} className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3 space-y-2">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{col.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {results[col.key].map(r => (
                    <button
                      key={r}
                      onClick={() => onSelectRhyme(r)}
                      className="px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 hover:bg-primary/10 hover:border-primary/40 hover:text-white transition-all font-mono"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}