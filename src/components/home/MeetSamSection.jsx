import { useLang } from "@/lib/i18n/LanguageContext";
import SamOverviewVideo from "@/components/home/SamOverviewVideo";
import SamWalkthrough from "@/components/home/SamWalkthrough";

// One strong SAM section, after the workspace sections: the overview video and
// the research-and-approval walkthrough live together here.
export default function MeetSamSection() {
  const { t } = useLang();
  return (
    <div className="border-t border-border">
      <section className="px-4 pt-16 pb-10">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("Your AI manager")}</p>
          <h2 className="font-heading text-3xl sm:text-5xl font-black tracking-tight">
            {t("SAM is ")}<span className="text-primary">{t("the team behind your releases.")}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t("SAM uses your music, stats, and goals to research opportunities and prepare personalized pitches. You approve supported emails before they're sent.")}
          </p>
          <p className="text-xs text-muted-foreground">{t("SAM is included with the Digital Manager plan.")}</p>
        </div>
      </section>

      {/* The narrated, chaptered overview video */}
      <section className="px-4 pb-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <h3 className="text-center font-heading text-2xl sm:text-3xl font-bold tracking-tight">
            {t("Watch how ")}<span className="text-primary">SAM</span>{t(" works")}
          </h3>
          <SamOverviewVideo />
        </div>
      </section>

      {/* The research-and-approval demonstration, two example tasks */}
      <SamWalkthrough />

      <section className="px-4 pb-16">
        <p className="max-w-2xl mx-auto text-center text-xs text-muted-foreground leading-relaxed">
          {t("SAM helps with research and preparation — the results depend on your music, your effort, and the opportunities out there. Nothing sends without your approval.")}
        </p>
      </section>
    </div>
  );
}