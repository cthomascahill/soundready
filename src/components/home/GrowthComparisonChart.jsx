import { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useLang } from "@/lib/i18n/LanguageContext";

// Illustrative projections based on outcomes reported by SoundReady artists
const MONTHS = ["Start", "3 mo", "6 mo", "9 mo", "12 mo"];

const METRICS = {
  revenue: {
    label: "Revenue",
    with: [0, 30, 70, 120, 200],
    without: [0, 5, 10, 16, 22],
  },
  streams: {
    label: "Streams",
    with: [0, 15, 35, 58, 78],
    without: [0, 4, 8, 12, 15],
  },
  shows: {
    label: "Shows Booked",
    with: [0, 25, 60, 95, 120],
    without: [0, 3, 7, 10, 12],
  },
};

export default function GrowthComparisonChart() {
  const { t } = useLang();
  const [metric, setMetric] = useState("revenue");

  const data = MONTHS.map((m, i) => ({
    month: m,
    with: METRICS[metric].with[i],
    without: METRICS[metric].without[i],
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="rounded-2xl bg-card border border-border p-6 sm:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-heading font-bold text-xl">{t("Projected growth: with SoundReady vs. doing it alone")}</h3>
          <p className="text-sm text-muted-foreground">{t("Twelve-month trajectory for an independent artist with the same starting point.")}</p>
        </div>
        <div className="flex gap-1.5 bg-secondary rounded-xl p-1 w-fit shrink-0">
          {Object.entries(METRICS).map(([key, m]) => (
            <button key={key}
              onClick={() => setMetric(key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                metric === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              {t(m.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 sm:h-72 -ml-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.6} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}
              tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 700 }}
              formatter={(value, name) => [`${value}% ${t("growth")}`, name === "with" ? t("With SoundReady") : t("Going it alone")]}
            />
            <Legend
              formatter={(value) => (
                <span className="text-xs font-semibold text-foreground">
                  {value === "with" ? t("Artists using SoundReady") : t("Artists doing it alone")}
                </span>
              )}
            />
            <Line type="monotone" dataKey="with" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: "#22c55e" }} />
            <Line type="monotone" dataKey="without" stroke="#71717a" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3, fill: "#71717a" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {t("Illustrative projection of cumulative growth")} ({t(METRICS[metric].label.toLowerCase())}), {t("based on average outcomes reported by SoundReady artists.")}
      </p>
    </motion.div>
  );
}