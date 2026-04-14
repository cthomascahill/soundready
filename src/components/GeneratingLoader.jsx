import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const STEPS = [
  { label: "Uploading your track...", duration: 1000 },
  { label: "Scanning audio patterns and frequency data...", duration: 2000 },
  { label: "Identifying hook moments and energy peaks...", duration: 2000 },
  { label: "Building your personalized launch plan...", duration: 3000 },
];

const TOTAL = 8000;

export default function GeneratingLoader() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let elapsed = 0;
    const timers = [];

    STEPS.forEach((step, i) => {
      const start = elapsed;
      timers.push(setTimeout(() => {
        setCurrentStep(i);
      }, start));
      timers.push(setTimeout(() => {
        setCompletedSteps((prev) => [...prev, i]);
      }, start + step.duration));
      elapsed += step.duration;
    });

    // Progress bar
    const tick = 50;
    let spent = 0;
    const interval = setInterval(() => {
      spent += tick;
      setProgress(Math.min(100, (spent / TOTAL) * 100));
      if (spent >= TOTAL) clearInterval(interval);
    }, tick);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-16 text-center"
      >
        <p className="font-heading font-bold text-2xl">
          <span className="text-primary">Sound</span>Ready
        </p>
      </motion.div>

      {/* Steps */}
      <div className="w-full max-w-sm space-y-5">
        {STEPS.map((step, i) => {
          const isDone = completedSteps.includes(i);
          const isActive = currentStep === i && !isDone;
          const isPending = currentStep < i;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-center gap-4"
            >
              <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                {isDone ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    className="h-2.5 w-2.5 rounded-full bg-primary"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  />
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full border border-border" />
                )}
              </div>
              <p className={`text-sm font-medium transition-colors ${isDone ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="fixed bottom-0 left-0 right-0 h-0.5 bg-border">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
          transition={{ ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}