import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

export default function LyricsAnalysis({ lyricsAnalysis, lyricsText, lyricsSource }) {
  const [lyricsOpen, setLyricsOpen] = useState(false);

  if (!lyricsAnalysis && !lyricsText) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border overflow-hidden space-y-0"
    >
      {lyricsAnalysis && (
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-chart-3 shrink-0" />
            <p className="text-xs text-chart-3 uppercase tracking-widest font-semibold">Lyrics Analysis</p>
          </div>
          <p className="text-foreground leading-relaxed text-[15px]">{lyricsAnalysis}</p>
        </div>
      )}

      {lyricsText && (
        <div className="border-t border-border">
          <button
            onClick={() => setLyricsOpen(!lyricsOpen)}
            className="w-full flex items-center justify-between px-6 py-4 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
          >
            <span className="flex items-center gap-2 font-medium">
              <FileText className="h-3.5 w-3.5" />
              Lyrics Analyzed
              {lyricsSource === "transcribed" && (
                <span className="text-[10px] bg-chart-5/10 text-chart-5 border border-chart-5/20 px-2 py-0.5 rounded-full">
                  Auto-transcribed
                </span>
              )}
              {lyricsSource === "pasted" && (
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                  Provided by artist
                </span>
              )}
            </span>
            {lyricsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {lyricsOpen && (
            <div className="px-6 pb-6">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed font-body bg-secondary/20 rounded-lg p-4 max-h-80 overflow-y-auto">
                {lyricsText}
              </pre>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}