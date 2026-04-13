import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube, ExternalLink, Search, Loader2, Eye, ThumbsUp, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

function fmt(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-secondary/60 border border-border p-3 text-center">
      <Icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
      <p className="font-heading font-bold text-lg">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function YouTubeStats({ analysis }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const lookup = async () => {
    setLoading(true);
    setNotFound(false);
    setData(null);
    const res = await base44.functions.invoke("youtubeChannelLookup", {
      artist: analysis.artist_name,
      song_title: analysis.title,
    });
    if (res.data.found) {
      setData(res.data);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="rounded-2xl bg-card border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Youtube className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg">YouTube Stats</h3>
            <p className="text-xs text-muted-foreground">Channel & video performance</p>
          </div>
        </div>
        {data && (
          <button onClick={lookup} disabled={loading}
            className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!data && !loading && !notFound && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-8 space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
              <Youtube className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Look Up on YouTube</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Pull live channel stats and top video performance for {analysis.artist_name}.
              </p>
            </div>
            <Button onClick={lookup} className="gap-2 bg-red-500 hover:bg-red-500/90 text-white font-semibold">
              <Search className="h-4 w-4" />Search YouTube
            </Button>
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-10">
            <Loader2 className="h-5 w-5 text-red-500 animate-spin" />
            <span className="text-sm text-muted-foreground">Searching YouTube...</span>
          </motion.div>
        )}

        {notFound && (
          <motion.div key="notfound" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-8 space-y-3">
            <p className="text-sm font-medium">Channel not found on YouTube</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              The artist name may differ from their YouTube channel name.
            </p>
            <Button onClick={lookup} variant="outline" size="sm" className="gap-2">
              <Search className="h-3.5 w-3.5" />Try Again
            </Button>
          </motion.div>
        )}

        {data && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Channel card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
              {data.channel.thumbnail && (
                <img src={data.channel.thumbnail} alt={data.channel.channel_title}
                  className="h-12 w-12 rounded-full object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold truncate">{data.channel.channel_title}</p>
                <p className="text-xs text-muted-foreground">{fmt(data.channel.video_count)} videos</p>
              </div>
              <a href={`https://www.youtube.com/channel/${data.channel.channel_id}`} target="_blank" rel="noopener noreferrer"
                className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors shrink-0">
                <ExternalLink className="h-3.5 w-3.5 text-red-500" />
              </a>
            </div>

            {/* Channel stats */}
            <div className="grid grid-cols-3 gap-2">
              <StatPill icon={Users} label="Subscribers" value={fmt(data.channel.subscriber_count)} />
              <StatPill icon={Eye} label="Total Views" value={fmt(data.channel.view_count)} />
              <StatPill icon={Youtube} label="Videos" value={fmt(data.channel.video_count)} />
            </div>

            {/* Top videos */}
            {data.videos?.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Top Videos</p>
                {data.videos.map((v, i) => (
                  <motion.a key={v.video_id} href={v.url} target="_blank" rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors border border-border">
                    {v.thumbnail && (
                      <img src={v.thumbnail} alt={v.title} className="h-12 w-20 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{v.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{fmt(v.view_count)}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{fmt(v.like_count)}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{fmt(v.comment_count)}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </motion.a>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}