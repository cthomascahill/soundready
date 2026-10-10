import { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useLang } from "@/lib/i18n/LanguageContext";

const MONTHS = ["Now", "3 mo", "6 mo", "9 mo", "12 mo"];
// Cumulative growth curves over 12 months (percent above the starting point)
const ALONE = [0, 4, 7, 11, 15];
const SCENARIOS = {
  conservative: { label: "Conservative", curve: [0, 10, 18, 28, 38], color: "#86efac" },
  moderate: { label: "Moderate", curve: [0, 20, 38, 58, 78], color: "#22c55e" },
  aggressive: { label: "Aggressive", curve: [0, 32, 60, 98, 140], color: "#15803d" },
};
// Rough industry multipliers to translate monthly listeners into the other metrics
const STREAMS_PER_LISTENER = 2.5; // streams per listener per month
const PER_STREAM = 0.004; // avg payout per stream, USD

const METRICS = {
  listeners: { label: "Monthly Listeners", money: false },
  streams: { label: "Streams", money: false },
  revenue: { label: "Revenue", money: true },
};

const compact = (v) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v);

export default function PersonalGrowthChart({ artistName, monthlyListeners }) {
  const { t } = useLang();
  const [metric, setMetric] = useState("listeners");

  const rawValue = (pct) => {
    const g = monthlyListeners * (1 + pct / 100);
    if (metric === "listeners") return g;
    if (metric === "streams") return g * STREAMS_PER_LISTENER;
    return g * STREAMS_PER_LISTENER * PER_STREAM;
  };

  const data = MONTHS.map((m, i) => ({
    month: m,
    without: Math.round(rawValue(ALONE[i])),
    conservative: Math.round(rawValue(SCENARIOS.conservative.curve[i])),
    moderate: Math.round(rawValue(SCENARIOS.moderate.curve[i])),
    aggressive: Math.round(rawValue(SCENARIOS.aggressive.curve[i])),
  }));

  const money = METRICS[metric].money;
  const fmt = (v) => (money ? `$${compact(v)}` : compact(v));

  const nowVal = data[0].moderate;
  const yearAlone = data[4].without;

  return (
    <div className="space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-heading font-bold text-lg sm:text-xl">
            {t("Your 12-month projection")}: {artistName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("From")} {fmt(nowVal)} {t("to")} <span className="text-primary font-bold">{fmt(data[4].conservative)}–{fmt(data[4].aggressive)}</span>{" "}
            {t("with SoundReady, vs")} {fmt(yearAlone)} {t("doing it alone.")}
          </p>
        </div>
        <div className="flex gap-1.5 bg-secondary rounded-xl p-1 w-fit shrink-0">
          {Object.entries(METRICS).map(([key, m]) => (
            <button key={key} onClick={() => setMetric(key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                metric === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              {t(m.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 sm:h-64 -ml-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.6} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}
              tickFormatter={fmt} width={48} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 700 }}
              formatter={(v, name) => [fmt(v), name === "without" ? t("Doing it alone") : `${t("With SoundReady")} · ${t(SCENARIOS[name]?.label || "")}`]}
            />
            <Legend formatter={(v) => (
              <span className="text-xs font-semibold text-foreground">
                {v === "without" ? t("Doing it alone") : `${t("With SoundReady")}: ${t(SCENARIOS[v]?.label || "")}`}
              </span>
            )} />
            {Object.entries(SCENARIOS).map(([key, s]) => (
              <Line key={key} type="monotone" dataKey={key}
                stroke={s.color} strokeWidth={key === "moderate" ? 3 : 2.5}
                strokeOpacity={key === "moderate" ? 1 : 0.9}
                dot={{ r: key === "moderate" ? 4 : 3, fill: s.color }} />
            ))}
            <Line type="monotone" dataKey="without" stroke="#71717a" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3, fill: "#71717a" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {t("Illustrative growth scenario using your current numbers and hypothetical growth assumptions. Actual results will vary.")}
      </p>
    </div>
  );
}