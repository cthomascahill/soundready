import { motion } from "framer-motion";
import { Music2, ListChecks, Users, Briefcase, MapPin, Rocket } from "lucide-react";

// Static, non-interactive mock: a quick look at the whole SoundReady platform
// that sits behind SAM. Part of the homepage overview video.
const AREAS = [
  { icon: Music2, title: "The Vault", sub: "Every song, organized" },
  { icon: ListChecks, title: "Song Tracker", sub: "Idea to release" },
  { icon: Users, title: "The Wall", sub: "Your artist feed" },
  { icon: Briefcase, title: "Deals", sub: "Labels and distributors" },
  { icon: MapPin, title: "Touring", sub: "Routes and finances" },
  { icon: Rocket, title: "Release Kit", sub: "Plan every drop" },
];

export default function StepPlatformScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-4 sm:px-10 py-6">
      <p className="font-heading text-lg sm:text-2xl font-black tracking-tight text-center">
        The <span className="text-primary">whole platform</span>, behind SAM
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 w-full max-w-2xl">
        {AREAS.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-border bg-card p-3 sm:p-4"
          >
            <a.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <p className="text-xs sm:text-sm font-bold mt-1.5">{a.title}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{a.sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}