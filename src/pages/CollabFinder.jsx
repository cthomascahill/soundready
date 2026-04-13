import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Music, Users, Send, Loader2, MessageSquare, X, Check, Inbox, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const MATCH_COLORS = ["border-primary/40 bg-primary/5", "border-accent/40 bg-accent/5", "border-chart-4/40 bg-chart-4/5"];

function ScoreBar({ value, color }) {
  return (
    <div className="h-1.5 rounded-full bg-secondary overflow-hidden w-16">
      <motion.div className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }} />
    </div>
  );
}

function MessageModal({ target, fromSong, currentUser, onClose }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    await base44.entities.CollabMessage.create({
      from_user_id: currentUser.id,
      from_user_name: currentUser.full_name || currentUser.email,
      to_user_id: target.created_by,
      to_user_email: target.created_by,
      subject: `Collab idea: "${fromSong?.title}" + your music`,
      message: message.trim(),
      song_title: fromSong?.title || "",
      read: false,
    });
    setSending(false);
    setSent(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-xl">Message {target.artist_name}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        {sent ? (
          <div className="text-center py-8 space-y-3">
            <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <Check className="h-7 w-7 text-accent" />
            </div>
            <p className="font-heading font-semibold">Message sent!</p>
            <p className="text-sm text-muted-foreground">They'll see it in their Collab Inbox.</p>
            <Button onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-secondary/50 border border-border p-3 text-sm">
              <p className="text-muted-foreground text-xs mb-1">Re: Your music + "{fromSong?.title}"</p>
              <p className="font-medium">To: {target.artist_name}</p>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder={`Hey ${target.artist_name}, I checked out your music and I think our styles would mesh really well...`}
              className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex gap-2">
              <Button onClick={send} disabled={sending || !message.trim()} className="gap-2">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Message
              </Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function InboxTab({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    base44.entities.CollabMessage.filter({ to_user_id: currentUser.id }, "-created_date", 50)
      .then((m) => { setMessages(m); setLoading(false); });
  }, []);

  const markRead = async (msg) => {
    if (!msg.read) {
      await base44.entities.CollabMessage.update(msg.id, { read: true });
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
    }
    setExpanded(expanded === msg.id ? null : msg.id);
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>;

  if (messages.length === 0) return (
    <div className="text-center py-14 text-muted-foreground">
      <Inbox className="h-10 w-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm">No messages yet. When artists reach out to collaborate, they'll appear here.</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {messages.map((msg) => (
        <div key={msg.id}
          className={`rounded-xl border p-4 cursor-pointer transition-all ${!msg.read ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}
          onClick={() => markRead(msg)}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {!msg.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
              <div>
                <p className="font-medium text-sm">{msg.from_user_name}</p>
                <p className="text-xs text-muted-foreground">{msg.subject}</p>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {expanded === msg.id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">{msg.message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function CollabFinder() {
  const [songs, setSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [matches, setMatches] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finding, setFinding] = useState(false);
  const [tab, setTab] = useState("find");
  const [messageTarget, setMessageTarget] = useState(null);
  const [messageSong, setMessageSong] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 50),
      base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 200),
    ]).then(([user, mySongs, all]) => {
      setCurrentUser(user);
      setSongs(mySongs.filter((s) => s.created_by === user.email));
      setAllSongs(all.filter((s) => s.created_by !== user.email));
      setSelectedId(mySongs.find((s) => s.created_by === user.email)?.id || "");
      setLoading(false);
    });
  }, []);

  const selectedSong = songs.find((s) => s.id === selectedId);

  const findMatches = async () => {
    if (!selectedSong || allSongs.length === 0) {
      // No other artists yet — generate AI suggestions instead
      setFinding(true);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a music collaboration matchmaker. Suggest 3 types of independent artists that would be perfect collaborators for this artist based on their sound.

Song: "${selectedSong.title}" by ${selectedSong.artist_name}
Genre: ${selectedSong.genre} | Mood: ${selectedSong.mood} | Energy: ${selectedSong.energy_level}
Similar Artists: ${(selectedSong.similar_artists || []).slice(0, 4).join(", ")}
TikTok Score: ${selectedSong.tiktok_score} | Overall: ${selectedSong.overall_score}

Describe 3 ideal collaborator profiles that would complement this artist's sound. Be specific.`,
        response_json_schema: {
          type: "object",
          properties: {
            profiles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  description: { type: "string" },
                  why_good_match: { type: "string" }
                }
              }
            }
          }
        }
      });
      setMatches({ aiProfiles: res.profiles, real: [] });
      setFinding(false);
      return;
    }

    setFinding(true);
    // Score each other artist song by compatibility
    const scored = allSongs.map((other) => {
      let score = 0;
      if (other.genre === selectedSong.genre) score += 30;
      if (other.energy_level === selectedSong.energy_level) score += 20;
      const scoreDiff = Math.abs((other.overall_score || 0) - (selectedSong.overall_score || 0));
      score += Math.max(0, 30 - scoreDiff); // closer score = better match
      const sharedArtists = (other.similar_artists || []).filter((a) => (selectedSong.similar_artists || []).includes(a));
      score += sharedArtists.length * 10;
      return { ...other, match_score: Math.min(100, score), shared_artists: sharedArtists };
    });
    const top = scored.sort((a, b) => b.match_score - a.match_score).slice(0, 6);
    setMatches({ real: top, aiProfiles: [] });
    setFinding(false);
  };

  const unreadCount = 0; // Could fetch but keeping it simple

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {messageTarget && (
        <MessageModal target={messageTarget} fromSong={messageSong} currentUser={currentUser}
          onClose={() => { setMessageTarget(null); setMessageSong(null); }} />
      )}

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-1">Artist Network</p>
        <h1 className="font-heading text-3xl font-bold">Collab Finder</h1>
        <p className="text-muted-foreground mt-1">Find artists with complementary sounds and reach out to collaborate.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {["find", "inbox"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px capitalize ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "inbox" ? "Collab Inbox" : "Find Collabs"}
          </button>
        ))}
      </div>

      {tab === "inbox" && currentUser && <InboxTab currentUser={currentUser} />}

      {tab === "find" && (
        <>
          {songs.length === 0 ? (
            <div className="text-center py-20">
              <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-heading text-xl font-semibold mb-2">Upload a track first</h2>
              <Link to="/upload"><Button>Upload a Track</Button></Link>
            </div>
          ) : (
            <>
              <motion.div className="rounded-2xl bg-card border border-border p-5 flex flex-col sm:flex-row gap-4 items-end"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium">Match based on</label>
                  <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setMatches([]); }}
                    className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {songs.map((s) => <option key={s.id} value={s.id}>{s.title} — {s.artist_name}</option>)}
                  </select>
                </div>
                <Button onClick={findMatches} disabled={finding || !selectedSong} className="gap-2 shrink-0">
                  {finding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  Find Matches
                </Button>
              </motion.div>

              {finding && (
                <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>Analyzing sonic compatibility...</span>
                </div>
              )}

              {/* Real matches */}
              {matches?.real?.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-heading font-semibold text-xl">Top Matches on SoundScore</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {matches.real.map((song, i) => (
                      <motion.div key={song.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className={`rounded-2xl border p-5 space-y-3 ${MATCH_COLORS[i % 3]}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-heading font-semibold">{song.artist_name}</p>
                            <p className="text-sm text-muted-foreground">{song.title} · {song.genre}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-heading font-bold text-lg text-accent">{song.match_score}%</p>
                            <p className="text-[10px] text-muted-foreground">match</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{song.mood}</span>
                          <span>·</span>
                          <span>{song.energy_level} energy</span>
                          <span>·</span>
                          <span>Score: {song.overall_score}</span>
                        </div>
                        {song.shared_artists?.length > 0 && (
                          <p className="text-xs text-primary">≈ Shared: {song.shared_artists.slice(0, 2).join(", ")}</p>
                        )}
                        <Button size="sm" variant="outline" onClick={() => { setMessageTarget(song); setMessageSong(selectedSong); }}
                          className="gap-2 w-full">
                          <MessageSquare className="h-3.5 w-3.5" />Reach Out
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI profiles (no real matches yet) */}
              {matches?.aiProfiles?.length > 0 && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-secondary/50 border border-border p-4 text-sm text-muted-foreground flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>No other artists on SoundScore yet to match with. Here's your ideal collaborator profile — share SoundScore with artists who fit this description!</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {matches.aiProfiles.map((p, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className={`rounded-2xl border p-5 space-y-2 ${MATCH_COLORS[i]}`}>
                        <p className="font-heading font-semibold">{p.type}</p>
                        <p className="text-sm text-muted-foreground">{p.description}</p>
                        <p className="text-xs text-accent">✦ {p.why_good_match}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}