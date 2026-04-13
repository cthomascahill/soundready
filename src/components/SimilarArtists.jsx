import { motion } from "framer-motion";
import { Users } from "lucide-react";

export default function SimilarArtists({ artists = [] }) {
  const colors = [
    "bg-primary/20 text-primary",
    "bg-accent/20 text-accent",
    "bg-chart-3/20 text-chart-3",
    "bg-chart-4/20 text-chart-4",
    "bg-chart-5/20 text-chart-5",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-card border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-heading font-semibold text-lg">Similar Artists</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Your sound is most similar to these artists based on style, production, and vibe.
      </p>
      <div className="flex flex-wrap gap-2">
        {artists.map((artist, i) => (
          <motion.span
            key={artist}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className={`px-4 py-2 rounded-full text-sm font-medium ${colors[i % colors.length]}`}
          >
            {artist}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}