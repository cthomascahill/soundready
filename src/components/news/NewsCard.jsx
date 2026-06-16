import { useState } from "react";
import { Bookmark, BookmarkCheck, ExternalLink, Clock } from "lucide-react";
import moment from "moment";

const CATEGORY_COLORS = {
  "Streaming & DSPs": "bg-blue-500/15 text-blue-400 border-blue-500/25",
  "Distribution": "bg-primary/15 text-primary border-primary/25",
  "Labels & Deals": "bg-purple-500/15 text-purple-400 border-purple-500/25",
  "Festivals & Tours": "bg-orange-500/15 text-orange-400 border-orange-500/25",
  "Independent Artists": "bg-teal-500/15 text-teal-400 border-teal-500/25",
  "Charts & Sales": "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  "Publishing & Sync": "bg-pink-500/15 text-pink-400 border-pink-500/25",
  "Industry News": "bg-zinc-700/50 text-zinc-300 border-zinc-600",
};

const SOURCE_ABBR = {
  "Billboard": "B",
  "Rolling Stone": "RS",
  "Pitchfork": "P",
  "Music Business Worldwide": "MBW",
  "Variety": "V",
  "Hypebeast": "HB",
  "Complex": "C",
  "The FADER": "F",
  "Consequence of Sound": "CoS",
};

export default function NewsCard({ article, saved, onSave }) {
  const [imgErr, setImgErr] = useState(false);
  const abbr = SOURCE_ABBR[article.source] || article.source?.slice(0, 3).toUpperCase();
  const catColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS["Industry News"];

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-all group">
      {/* Image */}
      {article.image && !imgErr ? (
        <div className="relative w-full aspect-video bg-zinc-900 overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgErr(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {article.personalized && (
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-black">✦ Picked for you</span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full aspect-video bg-zinc-900 flex items-center justify-center relative">
          <span className="text-4xl font-heading font-black text-zinc-700">{abbr}</span>
          {article.personalized && (
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-black">✦ Picked for you</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catColor}`}>
              {article.category}
            </span>
            <span className="text-xs text-zinc-500 font-medium">{article.source}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-600">
            <Clock className="h-3 w-3" />
            {moment(article.publishedAt).fromNow()}
          </div>
        </div>

        <h3 className="font-heading font-bold text-sm leading-snug line-clamp-2">{article.title}</h3>

        {article.description && (
          <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">{article.description}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            onClick={e => e.stopPropagation()}
          >
            Read More <ExternalLink className="h-3 w-3" />
          </a>
          <button
            onClick={() => onSave(article)}
            className={`p-1.5 rounded-lg transition-colors ${saved ? "text-primary bg-primary/10" : "text-zinc-500 hover:text-primary hover:bg-primary/10"}`}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}