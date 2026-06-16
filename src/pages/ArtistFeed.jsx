import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Heart, MessageCircle, Repeat2, Send, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

const MOOD_TAGS = [
  { id: "W", label: "🏆 W", color: "bg-primary/10 text-primary border-primary/20" },
  { id: "Question", label: "❓ Question", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { id: "New Music", label: "🎵 New Music", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { id: "Show", label: "🎤 Show Announcement", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { id: "Collab", label: "🤝 Looking for Collab", color: "bg-chart-5/10 text-chart-5 border-chart-5/20" },
  { id: "Motivation", label: "🔥 Motivation", color: "bg-red-500/10 text-red-400 border-red-500/20" },
];
const MOOD_MAP = Object.fromEntries(MOOD_TAGS.map(m => [m.id, m]));

const FILTERS = ["Everyone", "New Music", "W", "Collab", "Question", "Show", "Motivation"];

function PostCard({ post, currentUser, onLike, onComment, onRepost }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const liked = post.likes?.includes(currentUser?.id);
  const mood = MOOD_MAP[post.mood_tag];

  const loadComments = async () => {
    if (!commentsLoaded) {
      const c = await base44.entities.PostComment.filter({ post_id: post.id }, "created_date", 50);
      setComments(c);
      setCommentsLoaded(true);
    }
    setShowComments(v => !v);
  };

  const submitComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    const c = await base44.entities.PostComment.create({
      post_id: post.id,
      author_id: currentUser.id,
      author_name: currentUser.full_name || currentUser.email.split("@")[0],
      author_email: currentUser.email,
      text: commentText.trim(),
    });
    setComments(prev => [...prev, c]);
    setCommentText("");
    await base44.entities.ArtistPost.update(post.id, { comment_count: (post.comment_count || 0) + 1 });
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
          {(post.author_name || "?")?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm">{post.author_name || "Artist"}</p>
            {post.author_genre && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{post.author_genre}</span>}
            {mood && <span className={`text-[10px] px-2 py-0.5 rounded-full border ${mood.color}`}>{mood.label}</span>}
            <span className="text-[10px] text-muted-foreground ml-auto">{moment(post.created_date).fromNow()}</span>
          </div>
          <p className="text-sm mt-1.5 leading-relaxed">{post.text}</p>
          {post.link && <a href={post.link} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline break-all">{post.link}</a>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t border-border/50">
        <button onClick={() => onLike(post)} className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"}`}>
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          <span className="text-xs">{post.likes?.length || 0}</span>
        </button>
        <button onClick={loadComments} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs">{post.comment_count || 0}</span>
          {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        <button onClick={() => onRepost(post)} className={`flex items-center gap-1.5 text-sm transition-colors ${post.reposts?.includes(currentUser?.id) ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
          <Repeat2 className="h-4 w-4" />
          <span className="text-xs">{post.reposts?.length || 0}</span>
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
            {comments.map(c => (
              <div key={c.id} className="flex items-start gap-2 pl-4 border-l-2 border-border">
                <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold shrink-0">{c.author_name?.[0]?.toUpperCase()}</div>
                <div>
                  <p className="text-xs font-semibold">{c.author_name} <span className="font-normal text-muted-foreground">{moment(c.created_date).fromNow()}</span></p>
                  <p className="text-sm">{c.text}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pl-4">
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitComment()}
                placeholder="Add a comment..." className="flex-1 bg-secondary rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
              <Button size="sm" className="h-7 px-3 text-xs" onClick={submitComment} disabled={!commentText.trim()}>Post</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ArtistFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [moodTag, setMoodTag] = useState("");
  const [link, setLink] = useState("");
  const [filter, setFilter] = useState("Everyone");
  const [posting, setPosting] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.ArtistProfile.filter({ created_by_id: user.id }, "-created_date", 1).then(p => setProfile(p[0] || null)).catch(() => {});
    base44.entities.ArtistPost.list("-created_date", 50).then(p => { setPosts(p); setLoading(false); });
    const unsub = base44.entities.ArtistPost.subscribe(ev => {
      if (ev.type === "create") setPosts(prev => [ev.data, ...prev]);
      if (ev.type === "update") setPosts(prev => prev.map(p => p.id === ev.id ? ev.data : p));
      if (ev.type === "delete") setPosts(prev => prev.filter(p => p.id !== ev.id));
    });
    return unsub;
  }, [user]);

  const submit = async () => {
    if (!text.trim() || !user || posting) return;
    setPosting(true);
    await base44.entities.ArtistPost.create({
      author_id: user.id,
      author_name: profile?.stage_name || user.full_name || user.email.split("@")[0],
      author_email: user.email,
      author_genre: (profile?.genres || [])[0] || "",
      text: text.slice(0, 280),
      mood_tag: moodTag,
      link: link.trim() || undefined,
      likes: [],
      reposts: [],
      comment_count: 0,
    });
    setText(""); setMoodTag(""); setLink("");
    setPosting(false);
  };

  const handleLike = async (post) => {
    if (!user) return;
    const likes = post.likes || [];
    const newLikes = likes.includes(user.id) ? likes.filter(id => id !== user.id) : [...likes, user.id];
    await base44.entities.ArtistPost.update(post.id, { likes: newLikes });
  };

  const handleRepost = async (post) => {
    if (!user) return;
    const reposts = post.reposts || [];
    const newReposts = reposts.includes(user.id) ? reposts.filter(id => id !== user.id) : [...reposts, user.id];
    await base44.entities.ArtistPost.update(post.id, { reposts: newReposts });
  };

  const filteredPosts = filter === "Everyone"
    ? posts
    : posts.filter(p => p.mood_tag === filter);

  const trendingTags = MOOD_TAGS.map(m => ({
    ...m,
    count: posts.filter(p => p.mood_tag === m.id && moment(p.created_date).isAfter(moment().subtract(48, "hours"))).length
  })).filter(m => m.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Left sidebar */}
          <div className="w-56 shrink-0 hidden lg:block space-y-4">
            {/* Profile card */}
            <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {(profile?.stage_name || user?.full_name || "?")?.[0]?.toUpperCase()}
              </div>
              <p className="font-heading font-bold">{profile?.stage_name || user?.full_name}</p>
              <p className="text-xs text-muted-foreground">{(profile?.genres || []).join(", ") || "Independent Artist"}</p>
              <p className="text-xs text-muted-foreground">{posts.filter(p => p.author_id === user?.id).length} posts</p>
            </div>

            {/* Trending tags */}
            {trendingTags.length > 0 && (
              <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trending (48h)</p>
                {trendingTags.map(t => (
                  <div key={t.id} className="flex items-center justify-between">
                    <span className="text-sm">{t.label}</span>
                    <span className="text-xs text-muted-foreground">{t.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main feed */}
          <div className="flex-1 space-y-4 min-w-0">
            {/* Header */}
            <div>
              <p className="text-xs text-primary uppercase tracking-widest font-medium">Community</p>
              <h1 className="font-heading text-3xl font-bold">Artist Feed</h1>
            </div>

            {/* Compose */}
            <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
              <textarea value={text} onChange={e => setText(e.target.value.slice(0, 280))}
                placeholder="What's on your mind? Share a win, ask a question, find a collab..."
                className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none resize-none h-20" />
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {MOOD_TAGS.map(m => (
                    <button key={m.id} onClick={() => setMoodTag(moodTag === m.id ? "" : m.id)}
                      className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${moodTag === m.id ? m.color : "border-border text-muted-foreground hover:border-primary/40"}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-border pt-2">
                <input value={link} onChange={e => setLink(e.target.value)} placeholder="Add a link (optional)"
                  className="flex-1 bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none" />
                <span className="text-[10px] text-muted-foreground">{text.length}/280</span>
                <Button size="sm" onClick={submit} disabled={!text.trim() || posting} className="gap-1.5 h-8">
                  <Send className="h-3.5 w-3.5" />Post
                </Button>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                  {f}
                </button>
              ))}
            </div>

            {/* Posts */}
            {loading ? (
              <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-sm">No posts yet. Be the first to post!</div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} currentUser={user} onLike={handleLike} onComment={() => {}} onRepost={handleRepost} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}