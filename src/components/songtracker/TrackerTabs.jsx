import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TABS } from "@/lib/songStatus";

// Four primary views: Active, Upcoming, Released, All (with song counts)
export default function TrackerTabs({ value, counts, onChange }) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList>
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value} className="gap-2 data-[state=active]:text-primary">
            {t.label}
            <span className="text-[10px] text-muted-foreground">{counts[t.value]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}