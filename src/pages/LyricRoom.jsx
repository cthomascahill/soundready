import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Search, Loader2, Wand2, FileText, Clock, Tag, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

const TAG_OPTIONS = ["Hook", "Verse", "Bridge", "Full Song", "Freestyle", "Chorus", "Idea"];

const WORDS_PER_MIN = 120;

function wordCount(text) { return text.trim() ? text.trim().split(/\s+/).length : 0; }
function lineCount(text) { return text.trim() ? text.split("\n").filter(l => l.trim()).length : 0; }
function estLength(wc) {
  const secs = Math.round((wc / WORDS_PER_MIN) * 60);
  return secs < 60 ? `~${secs}s` : `~${Math.floor(secs / 60)}m ${secs % 60}s`;
}

export default function LyricRoom() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiMode, setAiMode] = useState(null);
  const [rewriteLine, setRewriteLine] = useState("");
  const [rhymeWord, setRhymeWord] = useState("");

  const saveTimer = useRef(null);
  const dirty = useRef(false);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.LyricDoc.filter({ created_by_id: user.id }, "-updated_date", 100)
      .then(d => { setDocs(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const save = useCallback(async (titleVal, contentVal, tagsVal, docId) => {
    if (!user?.id) return;
    setSaving(true);
    const wc = wordCount(contentVal);
    if (docId) {
      const updated = await base44.entities.LyricDoc.update(docId, { title: titleVal, content: contentVal, tags: tagsVal, word_count: wc });
      setDocs(prev => prev.map(d => d.id === docId ? { ...d, ...updated, title: titleVal, content: contentVal, tags: tagsVal, word_count: wc } : d));
    }
    setLastSaved(new Date());
    setSaving(false);
    dirty.current = false;
  }, [user]);

  // Auto-save every 30s
  useEffect(() => {
    if (!activeDoc) return;
    if (saveTimer.current) clearInterval(saveTimer.current);
    saveTimer.current = setInterval(() => {
      if (dirty.current) save(title, content, tags, activeDoc.id);
    }, 30000);
    return () => clearInterval(saveTimer.current);
  }, [activeDoc, title, content, tags, save]);

  const loadDoc = (doc) => {
    if (dirty.current && activeDoc) save(title, content, tags, activeDoc.id);
    setActiveDoc(doc);
    setTitle(doc.title);
    setContent(doc.content || "");
    setTags(doc.tags || []);
    setLastSaved(null);
    setAiResult(null);
    setAiMode(null);
    dirty.current = false;
  };

  const newDoc = async () => {
    const doc = await base44.entities.LyricDoc.create({ title: "Untitled", content: "", tags: [], word_count: 0 });
    setDocs(prev => [doc, ...prev]);
    loadDoc(doc);
  };

  const handleContentChange = (val) => { setContent(val); dirty.current = true; };
  const handleTitleChange = (val) => { setTitle(val); dirty.current = true; };

  const addTag = (t) => {
    const tag = (newTag || t).trim();
    if (!tag || tags.includes(tag)) return;
    const next = [...tags, tag];
    setTags(next);
    setNewTag("");
    dirty.current = true;
  };
  const removeTag = (t) => { setTags(prev => prev.filter(x => x !== t)); dirty.current = true; };

  const runAI = async (mode) => {
    setAiLoading(true);
    setAiMode(mode);
    setAiResult(null);
    let prompt = "";
    if (mode === "continue") {
      prompt = `You are a professional songwriter. Here are the current lyrics:\n\n${content}\n\nContinue this verse with the next 4 lines. Match the style, flow, and rhyme scheme. Output ONLY the 4 lines.`;
    } else if (mode === "rewrite") {
      prompt = `Rewrite this lyric line in 3 different ways. Make each version more vivid, punchy, or clever. Output exactly 3 numbered alternatives:\n\n"${rewriteLine}"`;
    } else if (mode === "rhyme") {
      prompt = `Give me 10 rhyme options for the word "${rhymeWord}". Mix perfect rhymes, slant rhymes, and multisyllabic options. Number them 1–10. Just the words/phrases, one per line.`;
    } else if (mode === "vibe") {
      prompt = `Analyze these song lyrics and write a short paragraph (3–5 sentences) describing the mood, themes, emotional energy, and what kind of listener this song would resonate with:\n\n${content}`;
    }
    const result = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6" });
    setAiResult(typeof result === "string" ? result : result?.text || "");
    setAiLoading(false);
  };

  const filteredDocs = docs.filter(d =>
    !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.content?.toLowerCase().includes(search.toLowerCase())
  );
  const wc = wordCount(content);
  const lc = lineCount(content);

  return (
    <div className="flex h-[calc(100vh-56px)] bg-background overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-60 shrink-0 border-r border-border bg-card/50 flex flex-col">
        <div className="p-3 border-b border-border space-y-2">
          <Button size="sm" onClick={newDoc} className="w-full gap-2"><Plus className="h-3.5 w-3.5" />New Document</Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search lyrics..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
          ) : filteredDocs.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No documents yet.</p>
          ) : filteredDocs.map(doc => (
            <button key={doc.id} onClick={() => loadDoc(doc)}
              className={`w-full text-left px-3 py-2.5 hover:bg-secondary/50 transition-colors border-b border-border/30 ${activeDoc?.id === doc.id ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}>
              <p className="text-sm font-medium truncate">{doc.title || "Untitled"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{moment(doc.updated_date || doc.created_date).fromNow()}</p>
              {doc.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {doc.tags.slice(0, 2).map(t => <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{t}</span>)}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN EDITOR */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        {!activeDoc ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
            <FileText className="h-12 w-12 text-muted-foreground/30" />
            <p className="font-heading font-semibold text-lg">Your Lyric Notebook</p>
            <p className="text-muted-foreground text-sm max-w-xs">Select a document from the sidebar or create a new one to start writing.</p>
            <Button onClick={newDoc} className="gap-2"><Plus className="h-4 w-4" />New Document</Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Title + meta bar */}
            <div className="px-6 pt-5 pb-3 border-b border-border space-y-3">
              <input
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                onBlur={() => save(title, content, tags, activeDoc.id)}
                placeholder="Song title..."
                className="w-full bg-transparent font-heading font-bold text-2xl placeholder:text-muted-foreground/40 focus:outline-none"
              />
              {/* Tags */}
              <div className="flex items-center flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {t} <button onClick={() => removeTag(t)}><X className="h-2.5 w-2.5" /></button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  {TAG_OPTIONS.filter(t => !tags.includes(t)).map(t => (
                    <button key={t} onClick={() => addTag(t)} className="text-[10px] px-2 py-0.5 rounded-full border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">{t}</button>
                  ))}
                  <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()}
                    placeholder="+ custom" className="bg-transparent text-[11px] w-20 focus:outline-none text-muted-foreground placeholder:text-muted-foreground/40" />
                </div>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={content}
              onChange={e => handleContentChange(e.target.value)}
              placeholder={"Start writing your lyrics here...\n\nVerse 1:\n..."}
              className="flex-1 w-full bg-transparent px-6 py-4 text-sm leading-7 font-mono placeholder:text-muted-foreground/30 focus:outline-none resize-none"
            />

            {/* Footer stats */}
            <div className="px-6 py-2 border-t border-border flex items-center gap-4 text-[11px] text-muted-foreground">
              <span>{wc} words</span>
              <span>{lc} lines</span>
              <span>Est. {estLength(wc)}</span>
              <span className="ml-auto flex items-center gap-1.5">
                {saving ? <><Loader2 className="h-3 w-3 animate-spin" />Saving...</> :
                  lastSaved ? <><Clock className="h-3 w-3" />Saved {moment(lastSaved).fromNow()}</> :
                  <span className="text-muted-foreground/40">Unsaved changes auto-save every 30s</span>}
              </span>
              <Button size="sm" variant="outline" className="h-6 text-[11px] px-2 ml-2" onClick={() => save(title, content, tags, activeDoc.id)}>Save Now</Button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT AI PANEL */}
      <div className="w-72 shrink-0 flex flex-col bg-card/30 overflow-y-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <p className="font-semibold text-sm">AI Assist</p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Powered by Claude Sonnet</p>
        </div>

        <div className="flex-1 p-4 space-y-4">
          {/* Continue verse */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Continue Writing</p>
            <Button size="sm" className="w-full gap-2" disabled={!activeDoc || !content.trim() || aiLoading}
              onClick={() => runAI("continue")}>
              {aiLoading && aiMode === "continue" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronRight className="h-3.5 w-3.5" />}
              Continue this verse
            </Button>
          </div>

          {/* Rewrite line */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rewrite a Line</p>
            <textarea value={rewriteLine} onChange={e => setRewriteLine(e.target.value)}
              placeholder="Paste a line to rewrite..."
              className="w-full h-16 rounded-lg border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
            <Button size="sm" variant="outline" className="w-full gap-2" disabled={!rewriteLine.trim() || aiLoading}
              onClick={() => runAI("rewrite")}>
              {aiLoading && aiMode === "rewrite" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
              Get 3 Alternatives
            </Button>
          </div>

          {/* Rhyme finder */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Find a Rhyme</p>
            <div className="flex gap-2">
              <Input value={rhymeWord} onChange={e => setRhymeWord(e.target.value)} placeholder="Word..."
                className="h-8 text-xs" onKeyDown={e => e.key === "Enter" && rhymeWord.trim() && runAI("rhyme")} />
              <Button size="sm" disabled={!rhymeWord.trim() || aiLoading} onClick={() => runAI("rhyme")} className="h-8 px-3">
                {aiLoading && aiMode === "rhyme" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Go"}
              </Button>
            </div>
          </div>

          {/* Vibe check */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vibe Check</p>
            <Button size="sm" variant="outline" className="w-full gap-2" disabled={!activeDoc || !content.trim() || aiLoading}
              onClick={() => runAI("vibe")}>
              {aiLoading && aiMode === "vibe" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "✦"}
              Analyze Full Lyric
            </Button>
          </div>

          {/* Result */}
          {aiLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
          {aiResult && !aiLoading && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                  {aiMode === "continue" ? "Suggested Lines" : aiMode === "rewrite" ? "Alternatives" : aiMode === "rhyme" ? "Rhymes" : "Vibe Check"}
                </p>
                <button onClick={() => { setContent(c => c + "\n\n" + aiResult); dirty.current = true; setAiResult(null); }}
                  className="text-[10px] text-primary hover:underline">Insert ↓</button>
              </div>
              <p className="text-xs whitespace-pre-wrap leading-6 text-foreground/90">{aiResult}</p>
              <button onClick={() => setAiResult(null)} className="text-[10px] text-muted-foreground hover:text-foreground">Dismiss</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}