import { motion } from "framer-motion";
import { Music, Waves, BarChart3, Brain, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: Music, label: "Uploading track..." },
  { icon: Waves, label: "Analyzing audio patterns..." },
  { icon: Brain, label: "Identifying similar artists..." },
  { icon: BarChart3, label: "Generating performance scores..." },
];

export default function AnalyzingLoader({ onCancel }) {
  const [step, setStep] = useState(0);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 600);

    // After 10s, show "taking longer than expected"
    const slowTimer = setTimeout(() => setSlow(true), 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(slowTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      {/* Animated rings */}
      <div className="relative h-32 w-32">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{
              scale: [1, 1.5 + i * 0.3],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <BarChart3 className="h-8 w-8 text-primary" />
          </motion.div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3 text-center">
        {steps.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: i <= step ? 1 : 0.3 }}
            className="flex items-center gap-3 text-sm"
          >
            <Icon className={`h-4 w-4 ${i <= step ? "text-primary" : "text-muted-foreground"}`} />
            <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>
              {label}
            </span>
            {i === step && (
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-primary"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            {i < step && <span className="text-accent text-xs">✓</span>}
          </motion.div>
        ))}
      </div>

      {slow && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Taking longer than usual — AI is still working...</span>
          </div>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel & Try Again
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}