import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function EngagementChart({ data = [], range }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
      <div>
        <p className="font-heading font-bold">Social Asset Engagement</p>
        <p className="text-xs text-muted-foreground">Views vs. link clicks over {range} days</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 0, bottom: 5, left: 0 }} barGap={2}>
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={Math.floor(range / 4)} />
          <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={30} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
          <Bar dataKey="views" fill="hsl(var(--chart-5))" radius={[3, 3, 0, 0]} name="Views" />
          <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Clicks" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}