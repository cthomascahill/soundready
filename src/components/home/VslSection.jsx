import { motion } from "framer-motion";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import ScenePlayer from "@/components/home/vsl/ScenePlayer";
import { VSL_SCENES } from "@/components/home/vsl/vslScenes";
import { useLang } from "@/lib/i18n/LanguageContext";

/**
 * The homepage VSL: a narrated, self-playing walkthrough of one artist's
 * whole journey, from sign-up to uploading songs, the Tracker, mixes and
 * notes, to working with SAM.
 */
export default function VslSection() {
  const { t } = useLang();

  return (
    <section className="px-4 py-16 border-t border-border scroll-mt-20" id="vsl">
      <div className="max-w-5xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-3"
        >
          <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("Watch the film")}</p>
          <h2 className="font-heading text-3xl sm:text-5xl font-black tracking-tight">
            {t("One artist, one minute,")}<br />
            <span className="text-primary">{t("the whole journey")}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t("From sign-up to SAM's first pitch: the Vault, the Tracker, mixes, notes and your AI manager.")}
          </p>
        </motion.div>

        <ScenePlayer
          scenes={VSL_SCENES}
          title="An artist's first day on SoundReady"
          logo={<SoundReadyLogo size={18} />}
          playLabel="Watch: from first upload to working with SAM"
        />
      </div>
    </section>
  );
}