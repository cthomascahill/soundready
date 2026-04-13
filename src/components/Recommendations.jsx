import { motion } from "framer-motion";
import { Lightbulb, CheckCircle2 } from "lucide-react";

export default function Recommendations({ strengths = [], recommendations = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl bg-card border border-border p-6"
    >
      <h3 className="font-heading font-semibold text-lg mb-5">Analysis & Recommendations</h3>

      {strengths.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-accent mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Strengths
          </p>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-sm text-muted-foreground pl-4 border-l-2 border-accent/30"
              >
                {s}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <p className="text-sm font-medium text-chart-4 mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            What to improve
          </p>
          <ul className="space-y-2">
            {recommendations.map((r, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="text-sm text-muted-foreground pl-4 border-l-2 border-chart-4/30"
              >
                {r}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}