import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FastForward, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";
import CountdownClock from "@/components/home/fiveminute/CountdownClock";
import MilestoneTimeline from "@/components/home/fiveminute/MilestoneTimeline";
import SuccessPanel from "@/components/home/fiveminute/SuccessPanel";

// The simulated five minutes play out over ~20 real seconds,
// one milestone completing every ~4 seconds.
const REAL_MS = 20000;
const SIM_SECONDS = 300;
const FINALE_DELAY = 800;

export default function FiveMinuteSection() {
  const { t } = useLang();
  const sectionRef = useRef(null);
  const elapsedRef = useRef(0);
  const startedRef = useRef(false);
  const [phase, setPhase] = useState("idle"); // idle | running | paused | done
  const [, setTick] = useState(0);
  const [panelIn, setPanelIn] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Smooth countdown: requestAnimationFrame with elapsed-time math.
  useEffect(() => {
    if (phase !== "running") return;
    let raf;
    const start = performance.now() - elapsedRef.current;
    const tick = (now) => {
      elapsedRef.current = Math.min(REAL_MS, now - start);
      if (elapsedRef.current >= REAL_MS) {
        setPhase("done");
        return;
      }
      setTick((n) => n + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // The countdown starts on its own the first time the section scrolls into view.
  const start = () => {
    elapsedRef.current = 0;
    setPanelIn(false);
    setPhase(reducedMotion ? "done" : "running");
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      if (!startedRef.current) {
        startedRef.current = true;
        start();
      }
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !startedRef.current) {
          startedRef.current = true;
          observer.disconnect();
          start();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // After 00:00, let the completed timeline breathe, then swap in the finale.
  useEffect(() => {
    if (phase !== "done") {
      setPanelIn(false);
      return;
    }
    const id = setTimeout(() => setPanelIn(true), reducedMotion ? 0 : FINALE_DELAY);
    return () => clearTimeout(id);
  }, [phase, reducedMotion]);

  const done = phase === "done";
  const progress = done ? 1 : Math.min(1, elapsedRef.current / REAL_MS);
  const remainingSec = done ? 0 : Math.max(0, Math.ceil(SIM_SECONDS * (1 - progress)));
  const completedCount = done ? 5 : Math.floor(progress * 5);
  const activeIndex = completedCount;

  const handleStart = () => {
    window.location.href = isAuth ? "/dashboard" : "/register";
  };
  const skip = () => {
    elapsedRef.current = REAL_MS;
    setPhase("done");
  };
  const replay = () => {
    elapsedRef.current = 0;
    setPanelIn(false);
    setPhase("running");
  };

  const timeline = (
    <MilestoneTimeline completedCount={completedCount} activeIndex={activeIndex} />
  );

  return (
    <section ref={sectionRef} className="px-4 py-20 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.02]">
            {t("It only takes 5 minutes to")}{" "}
            <span className="text-primary">{t("change your career")}</span>
          </h2>
        </motion.div>

        {/* Clock beside the milestone timeline (stacked on mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          <div className="lg:sticky lg:top-24">
            <CountdownClock remainingSec={remainingSec} progress={progress} done={done} />
            {phase !== "idle" && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {phase === "running" && !reducedMotion && (
                  <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={skip}>
                    <FastForward className="h-3.5 w-3.5" />
                    {t("Skip animation")}
                  </Button>
                )}
                {done && !reducedMotion && (
                  <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={replay}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t("Replay")}
                  </Button>
                )}
              </div>
            )}
          </div>

          {timeline}
        </div>

        {/* Grand finale: appears centered below the completed timeline */}
        {panelIn && (
          <div className="max-w-3xl mx-auto">
            <SuccessPanel onStart={handleStart} />
          </div>
        )}
      </div>
    </section>
  );
}