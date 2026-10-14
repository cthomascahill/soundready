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
          <h2 className="font-heading text-3xl sm:text-6xl font-black tracking-tight">
            {t("How SoundReady ")}<span className="text-primary">{t("works")}</span>
          </h2>
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