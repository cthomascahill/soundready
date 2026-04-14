import { motion } from "framer-motion";

export default function ReportSection({ number, title, icon: Icon, color = "text-primary", children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: number * 0.07 }}
      className="rounded-2xl bg-card border border-border overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/60">
        <div className={`h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Section {number}</span>
        <h2 className="font-heading font-semibold text-base ml-1">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </motion.div>
  );
}