import { useLang } from "@/lib/i18n/LanguageContext";
import SamOverviewVideo from "@/components/home/SamOverviewVideo";
import SamWalkthrough from "@/components/home/SamWalkthrough";

// SAM does the work, you approve — the toggle walkthrough first, then the
// narrated "Watch how SAM works" video right under it.
export default function MeetSamSection() {
  const { t } = useLang();
  return (
    <div className="border-t border-border">
      <SamWalkthrough />

      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto space-y-6">
          <h3 className="text-center font-heading text-2xl sm:text-3xl font-bold tracking-tight">
            {t("Watch how ")}<span className="text-primary">SAM</span>{t(" works")}
          </h3>
          <SamOverviewVideo />
        </div>
      </section>
    </div>
  );
}