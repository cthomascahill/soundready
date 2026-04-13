import ScoreRing from "./ScoreRing";
import { motion } from "framer-motion";

export default function PlatformScores({ analysis }) {
  const platforms = [
    { key: "spotify_score", label: "Spotify", color: "chart2" },
    { key: "apple_music_score", label: "Apple Music", color: "chart5" },
    { key: "youtube_score", label: "YouTube", color: "chart3" },
    { key: "tiktok_score", label: "TikTok", color: "chart4" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-card border border-border p-6"
    >
      <h3 className="font-heading font-semibold text-lg mb-6">Platform Performance</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {platforms.map(({ key, label, color }) => (
          <ScoreRing
            key={key}
            score={analysis[key] || 0}
            size={100}
            label={label}
            color={color}
          />
        ))}
      </div>
    </motion.div>
  );
}