import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { BarChart2, Send, Plus, Loader2, Bot, User } from "lucide-react";

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
          <BarChart2 className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? "bg-secondary text-foreground"
          : "bg-card border border-border text-foreground"
      }`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            components={{
              p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="my-0.5">{children}</li>,
              strong: ({ children }) => <strong className="text-primary font-semibold">{children}</strong>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
        {message.tool_calls?.filter(t => t.status === "running" || t.status === "in_progress").length > 0 && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Analyzing your data...
          </div>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export default function StreamingAnalyst() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.agents.listConversations({ agent_name: "streaming_analyst" })
      .then((convs) => {
        setConversations(convs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    const unsub = base44.agents.subscribeToConversation(activeConv.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [activeConv?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: "streaming_analyst",
      metadata: { name: `Analysis ${new Date().toLocaleDateString()}` },
    });
    setConversations((prev) => [conv, ...prev]);
    setActiveConv(conv);
    setMessages([]);
  };

  const openConversation = async (conv) => {
    const full = await base44.agents.getConversation(conv.id);
    setActiveConv(full);
    setMessages(full.messages || []);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    let conv = activeConv;
    if (!conv) {
      conv = await base44.agents.createConversation({
        agent_name: "streaming_analyst",
        metadata: { name: text.slice(0, 40) },
      });
      setConversations((prev) => [conv, ...prev]);
      setActiveConv(conv);
    }

    await base44.agents.addMessage(conv, { role: "user", content: text });
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const visibleMessages = messages.filter((m) => m.role === "user" || (m.role === "assistant" && m.content));

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <span className="font-heading font-bold text-sm">Streaming Analyst</span>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={startNewConversation}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center pt-8">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center pt-8 px-4">No sessions yet. Start a new analysis.</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                  activeConv?.id === conv.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <p className="font-medium truncate">{conv.metadata?.name || "Analysis"}</p>
                <p className="text-[10px] opacity-60 mt-0.5">
                  {new Date(conv.created_date).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center px-6 gap-3 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <BarChart2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-heading font-bold text-sm">Streaming Performance Analyst</p>
            <p className="text-xs text-muted-foreground">Powered by your track data & AI activity history</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {!activeConv && visibleMessages.length === 0 && (
            <div className="max-w-xl mx-auto pt-16 text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                <BarChart2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-heading font-bold text-2xl">Streaming Performance Analyst</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Ask me about any of your uploaded tracks. I'll cross-reference your audio metrics with your AI activity history to give you concrete, data-backed insights and a clear action plan.
              </p>
              <div className="grid grid-cols-1 gap-2 pt-2">
                {[
                  "Analyze my latest track's streaming potential",
                  "Which of my songs has the best playlist placement odds?",
                  "What's holding back my stream counts based on my data?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="text-left px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/30 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {visibleMessages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3 text-sm text-muted-foreground">
                Analyzing your data...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border shrink-0">
          <div className="flex gap-2 items-end max-w-4xl mx-auto">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about a track, your streaming metrics, or what to do next..."
              className="resize-none min-h-[44px] max-h-32 text-sm"
              rows={1}
            />
            <Button
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={sendMessage}
              disabled={!input.trim() || sending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}