import { useState } from "react";
import { Eye, Heart, MessageCircle, Send, Bookmark, Music2, Play } from "lucide-react";
import ReportSection from "../ReportSection";

function InstagramPreview({ caption, songTitle, artist }) {
  return (
    <div className="rounded-2xl bg-white text-black overflow-hidden w-full max-w-sm mx-auto shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
          {artist?.charAt(0) || "A"}
        </div>
        <div>
          <p className="text-xs font-semibold leading-none">{artist || "your_artist_name"}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">New Release</p>
        </div>
        <button className="ml-auto text-[11px] font-semibold text-blue-500">Follow</button>
      </div>

      {/* Image placeholder */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 aspect-square flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
        <div className="text-center z-10">
          <div className="h-16 w-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center mx-auto mb-3">
            <Play className="h-7 w-7 text-primary fill-primary" />
          </div>
          <p className="text-white font-bold text-sm">{songTitle}</p>
          <p className="text-white/60 text-xs">{artist}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 flex items-center gap-4">
        <Heart className="h-5 w-5 text-gray-800" />
        <MessageCircle className="h-5 w-5 text-gray-800" />
        <Send className="h-5 w-5 text-gray-800" />
        <Bookmark className="h-5 w-5 text-gray-800 ml-auto" />
      </div>
      <div className="px-4 pb-1">
        <p className="text-xs font-semibold text-gray-800">1,234 likes</p>
      </div>

      {/* Caption */}
      <div className="px-4 pb-4">
        <p className="text-xs text-gray-800 leading-relaxed line-clamp-4">
          <span className="font-semibold">{artist || "yourname"}</span>{" "}
          {caption}
        </p>
      </div>
    </div>
  );
}

function TikTokPreview({ caption, songTitle, artist }) {
  return (
    <div className="rounded-2xl bg-black text-white overflow-hidden w-full max-w-sm mx-auto shadow-xl" style={{ aspectRatio: "9/16", maxHeight: 480 }}>
      {/* Video bg */}
      <div className="relative h-full flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950">
        {/* Center art */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-20 w-20 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center mx-auto mb-3 animate-spin" style={{ animationDuration: "8s" }}>
              <Music2 className="h-8 w-8 text-primary" />
            </div>
            <p className="text-white font-bold">{songTitle}</p>
            <p className="text-white/60 text-sm">{artist}</p>
          </div>
        </div>

        {/* Right sidebar actions */}
        <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
            <span className="text-xs">42.1K</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </div>
            <span className="text-xs">1.2K</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <Send className="h-5 w-5" />
            </div>
            <span className="text-xs">Share</span>
          </div>
        </div>

        {/* Bottom info */}
        <div className="p-4 pb-5">
          <p className="text-xs font-semibold mb-1">@{artist?.toLowerCase().replace(/\s+/g, "_") || "yourname"}</p>
          <p className="text-xs text-white/80 leading-relaxed line-clamp-3">{caption}</p>
          <div className="flex items-center gap-2 mt-2">
            <Music2 className="h-3 w-3 text-white/60" />
            <p className="text-xs text-white/60 truncate">{songTitle} · {artist}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SocialPreview({ captions = {}, song = {} }) {
  const [tab, setTab] = useState("instagram");

  return (
    <ReportSection number={7} title="Social Preview" icon={Eye} color="text-chart-3">
      <div className="space-y-4">
        <div className="flex rounded-xl bg-secondary p-1 gap-1 w-fit mx-auto">
          {["instagram", "tiktok"].map((p) => (
            <button
              key={p}
              onClick={() => setTab(p)}
              className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${tab === p ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              {p === "tiktok" ? "TikTok" : "Instagram"}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          {tab === "instagram" ? (
            <InstagramPreview caption={captions.instagram || ""} songTitle={song.title} artist={song.artist} />
          ) : (
            <TikTokPreview caption={captions.tiktok || ""} songTitle={song.title} artist={song.artist} />
          )}
        </div>
      </div>
    </ReportSection>
  );
}