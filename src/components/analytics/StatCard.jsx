import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, trend, color }) {
  const isUp = trend?.startsWith("+");
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isUp ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
          {trend}
        </span>
      </div>
      <p className={`font-heading text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </motion.div>
  );
}