import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { RotateCcw, Send, Loader2, ChevronRight } from "lucide-react";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import SamLogo from "@/components/SamLogo";
import VoiceButton from "@/components/VoiceButton";
import WorkspaceToggle from "@/components/asksam/WorkspaceToggle";
import ChatMessage from "@/components/asksam/ChatMessage";
import { askSamCall } from "@/lib/askSam";
import { toolByPath } from "@/lib/askSamTools";
import {
  buildSystemPrompt, buildPlatformDataContext, buildPipelineContext, buildMemorySection,
} from "@/components/MayaAssistant";

const SUGGESTIONS = [
  "Show me my song tracker",
  "What should I focus on this week?",
  "Help me pitch my song to playlists",
  "Where should I play live next?",
  "What are my royalties looking like?",
  "Open my Vault",
];

/**
 * Ask Sam: the chat-first view of the whole platform. Looks like a simple
 * chat, but Sam can pull up any tool right inside it.
 */
export default function AskSam() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chips, setChips] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const systemPromptRef = useRef(null);
  const bottomRef = useRef(null);

  // Load the artist's context once, same as Sam's floating chat
  useEffect(() => {
    if (!user?.id || profileLoaded) return;
    Promise.all([
      base44.entities.ArtistProfile.filter({ created_by_id: user.id }, "-created_date", 1).catch(() => []),
      base44.entities.PlatformConnection.filter({ created_by_id: user.id }, "-created_date", 20).catch(() => []),
      base44.entities.PipelineSong.filter({ created_by_id: user.id }, "sort_order", 50).catch(() => []),
      base44.entities.MayaMemory.filter({ user_id: user.id }, "-created_date", 200).catch(() => []),
    ]).then(([profiles, conns, pipelineSongs, memories]) => {
      const prof = profiles[0] || null;
      setProfile(prof);
      systemPromptRef.current =
        buildSystemPrompt(prof, [], []) +
        buildPlatformDataContext(conns) +
        buildPipelineContext(pipelineSongs, []) +
        buildMemorySection(memories);
      setProfileLoaded(true);
    });
  }, [user, profileLoaded]);

  // Restore this artist's last conversation
  useEffect(() => {
    if (!user?.id) return;
    try {
      const saved = JSON.parse(localStorage.getItem(`asksam_chat_${user.id}`) || "[]");
      if (Array.isArray(saved)) setMessages(saved);
    } catch {}
  }, [user?.id]);

  // Persist as the conversation grows (keep the last 40 messages)
  useEffect(() => {
    if (!user?.id || messages.length === 0) return;
    try {
      localStorage.setItem(`asksam_chat_${user.id}`, JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading || !profileLoaded) return;
    setInput("");
    setChips([]);
    // Only the newest tool stays open, so the screen never piles up
    const cleared = [...messages, { role: "user", content: msg }].map((m) =>
      m.tool_path ? { ...m, tool_path: null } : m
    );
    setMessages(cleared);
    setLoading(true);

    let result = null;
    try {
      result = await askSamCall(cleared, systemPromptRef.current || buildSystemPrompt(null, [], []));
    } catch (err) {
      console.error("Ask Sam chat error:", err);
    }
    // Only a real path from the catalog ever opens, a hallucinated path is dropped
    const navPath = (result?.navigate_path || "").trim();
    const tool = navPath ? toolByPath(navPath) : null;
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: result?.response || "Sorry, I hit a snag. Try again in a moment.",
        tool_path: tool?.path || null,
      },
    ]);
    setChips((result?.chips || []).filter((c) => typeof c === "string" && c.trim()).slice(0, 3));
    setLoading(false);
  };

  const closeTool = (idx) =>
    setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, tool_path: null } : m)));

  const startNewChat = () => {
    setMessages([]);
    setChips([]);
    try { localStorage.removeItem(`asksam_chat_${user?.id}`); } catch {}
  };

  const artistName = profile?.stage_name || user?.full_name || "artist";
  const showWelcome = messages.length === 0;

  return (
    <div className="h-screen flex flex-col bg-background font-body">
      {/* Header */}
      <header className="h-14 shrink-0 border-b border-border flex items-center gap-3 px-4 sm:px-6">
        <Link to="/history"><SoundReadyLogo size={24} /></Link>
        <div className="flex-1" />
        <WorkspaceToggle mode="chat" />
        <button
          onClick={startNewChat}
          title="Start a new chat"
          className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {showWelcome && !profileLoaded && (
            <div className="flex justify-center pt-16">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}

          {showWelcome && profileLoaded && (
            <div className="pt-10 sm:pt-20 space-y-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <SamLogo className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h1 className="font-heading text-3xl sm:text-4xl font-bold">
                    Where should we start, {artistName}?
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Ask me anything, or tell me what you want to do. I'll open the right tool right here.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-sm px-4 py-3 rounded-xl bg-card border border-border text-foreground/85 hover:border-primary/40 hover:text-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} onToolClose={() => closeTool(i)} />
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                <SamLogo className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1.5 pt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {chips.length > 0 && !loading && (
            <div className="flex flex-wrap gap-2 pl-11">
              {chips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => send(chip)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted border border-border text-foreground/80 hover:bg-accent hover:text-foreground hover:border-primary/30 transition-all"
                >
                  <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                  {chip}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-background/90 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-muted px-4 py-3 focus-within:border-primary/40 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Ask Sam to do anything..."
              rows={1}
              disabled={loading || !profileLoaded}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none max-h-32 disabled:opacity-50"
              style={{ minHeight: "22px" }}
            />
            <VoiceButton onText={(text) => setInput((prev) => (prev ? prev.trim() + " " : "") + text.trim())} />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading || !profileLoaded}
              className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Enter to send · Shift+Enter for a new line
          </p>
        </div>
      </div>
    </div>
  );
}