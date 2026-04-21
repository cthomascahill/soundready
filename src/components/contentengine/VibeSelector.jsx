import { motion } from "framer-motion";
import { Flame, Heart, Star, BookOpen } from "lucide-react";

const VIBES = [
  {
    id: "aggressive",
    label: "Aggressive",
    icon: Flame,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    activeBorder: "border-red-500/60",
    activeBg: "bg-red-500/15",
    ring: "ring-red-500/30",
    desc: "High energy, dark cinematic, wolves, fast motion, intensity",
    tags: ["Dark cinematic", "Fast cuts", "Power visuals"],
  },
  {
    id: "emotional",
    label: "Emotional",
    icon: Heart,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    activeBorder: "border-blue-500/60",
    activeBg: "bg-blue-500/15",
    ring: "ring-blue-500/30",
    desc: "Rain, solitude, city at night, slow motion, vulnerability",
    tags: ["Slow motion", "Rainy nights", "Solitude"],
  },
  {
    id: "confident",
    label: "Confident",
    icon: Star,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/25",
    activeBorder: "border-yellow-500/60",
    activeBg: "bg-yellow-500/15",
    ring: "ring-yellow-500/30",
    desc: "Luxury, nightlife, cars, skylines, fashion, swagger",
    tags: ["Luxury aesthetic", "City skylines", "Fashion"],
  },
  {
    id: "storytelling",
    label: "Storytelling",
    icon: BookOpen,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/25",
    activeBorder: "border-teal-500/60",
    activeBg: "bg-teal-500/15",
    ring: "ring-teal-500/30",
    desc: "Lifestyle scenes, people, daily moments, real life",
    tags: ["Lifestyle", "Real moments", "Human stories"],
  },
];

export default function VibeSelector({ selectedVibe, onSelect }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading font-bold text-xl">Select your vibe</h2>
        <p className="text-muted-foreground text-sm mt-1">This shapes the visuals, color grade, and energy of your clips.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VIBES.map((vibe) => {
          const isSelected = selectedVibe === vibe.id;
          return (
            <motion.button
              key={vibe.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(vibe.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all space-y-3 ${
                isSelected
                  ? `${vibe.activeBg} ${vibe.activeBorder} ring-2 ${vibe.ring}`
                  : `bg-card ${vibe.border} hover:${vibe.activeBg}`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl ${vibe.bg} border ${vibe.border} flex items-center justify-center`}>
                  <vibe.icon className={`h-5 w-5 ${vibe.color}`} />
                </div>
                {isSelected && (
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${vibe.bg} border ${vibe.activeBorder}`}>
                    <div className={`h-2.5 w-2.5 rounded-full ${vibe.color.replace("text-", "bg-")}`} />
                  </div>
                )}
              </div>
              <div>
                <p className={`font-heading font-bold text-lg ${isSelected ? vibe.color : "text-foreground"}`}>{vibe.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{vibe.desc}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {vibe.tags.map((tag) => (
                  <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${vibe.bg} ${vibe.color} border ${vibe.border}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}