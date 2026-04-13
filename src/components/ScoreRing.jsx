import { motion } from "framer-motion";

export default function ScoreRing({ score, size = 120, label, color = "primary" }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colorMap = {
    primary: "hsl(var(--primary))",
    accent: "hsl(var(--accent))",
    chart1: "hsl(var(--chart-1))",
    chart2: "hsl(var(--chart-2))",
    chart3: "hsl(var(--chart-3))",
    chart4: "hsl(var(--chart-4))",
    chart5: "hsl(var(--chart-5))",
  };

  const strokeColor = colorMap[color] || colorMap.primary;

  const getScoreLabel = (s) => {
    if (s >= 85) return "Excellent";
    if (s >= 70) return "Strong";
    if (s >= 50) return "Average";
    if (s >= 30) return "Below Avg";
    return "Weak";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="6"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-heading font-bold text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {getScoreLabel(score)}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      )}
    </div>
  );
}