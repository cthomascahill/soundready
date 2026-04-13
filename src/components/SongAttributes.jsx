import { motion } from "framer-motion";
import { Zap, Heart, RotateCcw, Mic2 } from "lucide-react";

function AttributeBar({ label, value, icon: Icon, delay }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-heading font-semibold">{value}/100</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay }}
        />
      </div>
    </div>
  );
}

export default function SongAttributes({ analysis }) {
  const attributes = [
    { label: "Hook Strength", value: analysis.hook_strength || 0, icon: Mic2 },
    { label: "Production Quality", value: analysis.production_quality || 0, icon: Zap },
    { label: "Replay Value", value: analysis.replay_value || 0, icon: RotateCcw },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl bg-card border border-border p-6"
    >
      <h3 className="font-heading font-semibold text-lg mb-2">Track Attributes</h3>
      <div className="flex flex-wrap gap-3 mb-6">
        {analysis.mood && (
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {analysis.mood}
          </span>
        )}
        {analysis.energy_level && (
          <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
            {analysis.energy_level} energy
          </span>
        )}
        {analysis.bpm_estimate && (
          <span className="px-3 py-1 rounded-full bg-chart-4/10 text-chart-4 text-xs font-medium">
            ~{analysis.bpm_estimate} BPM
          </span>
        )}
      </div>
      <div className="space-y-5">
        {attributes.map((attr, i) => (
          <AttributeBar key={attr.label} {...attr} delay={0.5 + i * 0.15} />
        ))}
      </div>
    </motion.div>
  );
}