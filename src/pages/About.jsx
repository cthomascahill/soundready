import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import SEO from "@/components/SEO";

import MeetSamSection from "@/components/home/MeetSamSection";
import MattCormanSection from "@/components/home/MattCormanSection";
import HeroArtistSearch from "@/components/home/HeroArtistSearch";
import VslSection from "@/components/home/VslSection";
import VsRestSection from "@/components/home/VsRestSection";
import WithWithoutSection from "@/components/home/WithWithoutSection";
import FiveMinuteSection from "@/components/home/FiveMinuteSection";
import FaqSection from "@/components/home/FaqSection";
import PlanCards from "@/components/pricing/PlanCards";
import { useLang } from "@/lib/i18n/LanguageContext";



export default function About() {
  const [isAuth, setIsAuth] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  const handleCTA = () => {
    if (isAuth) window.location.href = "/dashboard";
    else window.location.href = "/register";
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="SoundReady: Your Music Workspace for Independent Artists"
        description="SoundReady keeps your songs, mixes, feedback, and release progress together in one workspace, with SAM, an AI manager, to help you take the next step. Start free."
      />

      <PublicNav showHome={false} />

      {/* HERO: your career in motion, SAM big right beside it */}
      <section className="relative px-4 pt-24 pb-16 overflow-hidden">
        {/* Soft ambient glows behind the hero */}
        <div className="absolute -top-48 -left-48 h-[640px] w-[640px] rounded-full bg-primary/15 blur-[140px] pointer-events-none" />
        <div className="absolute -top-40 -right-56 h-[560px] w-[560px] rounded-full bg-chart-2/10 blur-[160px] pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-10 xl:gap-20 items-center">
          {/* Left: the offer and the artist search */}
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-center lg:text-left">
            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]">
              {t("Your music")}<br />
              <span className="text-primary">{t("in motion")}</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t("Keep your songs and mixes together, prepare your releases, and let SAM find opportunities and handle outreach with your approval.")}
            </p>
            <div>
              <Button size="lg" className="gap-2 font-heading font-bold text-sm sm:text-base px-6 sm:px-8 h-12" onClick={handleCTA}>
                {t("Start Free")}
              </Button>
            </div>
            <div className="pt-2">
              <HeroArtistSearch />
            </div>
          </motion.div>

          {/* Right: SAM, big, right next to the copy */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col items-center justify-center gap-4"
          >
            <motion.img
              src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/b7f9a17dc_generated_f31f1bbd.png"
              alt="SAM, your SoundReady Artist Manager"
              className="h-[300px] sm:h-[400px] lg:h-[440px] xl:h-[520px] w-auto drop-shadow-2xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />
            <div className="rounded-xl border border-primary/30 bg-card px-4 py-2.5 shadow-xl text-center">
              <p className="text-sm font-bold text-primary">Meet SAM</p>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-bold">S</span>oundReady{" "}
                <span className="text-primary font-bold">A</span>rtist{" "}
                <span className="text-primary font-bold">M</span>anager
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* THE VSL: one artist's whole journey, right after Start Free */}
      <VslSection />

      {/* WITHOUT SOUNDREADY VS. WITH SOUNDREADY */}
      <WithWithoutSection />

      {/* FOUNDER STORY */}
      <MattCormanSection />

      {/* IN JUST 5 MINUTES */}
      <FiveMinuteSection />

      {/* MEET SAM: SAM does the work, you approve */}
      <MeetSamSection />

      {/* TODAY VS. SOUNDREADY */}
      <VsRestSection />

      {/* PRICING, 3 tiers */}
      <section id="pricing" className="px-4 py-16 scroll-mt-20">
        <div className="max-w-5xl mx-auto space-y-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("Pricing")}</p>
            <h2 className="font-heading text-3xl sm:text-5xl font-black tracking-tight">
              {t("Your next three songs are free")}<br />
              <span className="text-primary">{t("Add SAM when you're ready")}</span>
            </h2>
          </motion.div>

          <PlanCards />

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            {t("Payments secured by Stripe · Cancel anytime")}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection />

      {/* FINAL CTA */}
      <section className="px-4 py-24 text-center bg-gradient-to-t from-primary/8 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-4">
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
              {t("Your music")}<br />
              <span className="text-primary">{t("in motion")}</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {t("Start with three songs free. Add SAM when you're ready.")}
            </p>
          </div>
          <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12" onClick={handleCTA}>
            {t("Start Free")}
          </Button>
          <p className="text-xs sm:text-sm text-muted-foreground">{t("Start with 3 songs. No card required.")}</p>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
}