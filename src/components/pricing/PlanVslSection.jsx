import { motion } from "framer-motion";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import ScenePlayer from "@/components/home/vsl/ScenePlayer";
import { PLAN_VSL_SCENES } from "@/components/pricing/planVslScenes";

/**
 * The pricing-page VSL: a narrated walkthrough of each plan, what Free
 * actually covers, the full Artist Pro workspace, and why Digital Manager
 * is the grand slam offer, ending on a concrete example of what 2,500 SAM
 * credits covers in a real month.
 */
export default function PlanVslSection() {
  return (
    <section className="px-4 py-16 scroll-mt-20" id="plan-vsl">
      <div className="max-w-5xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-3"
        >
          <h2 className="font-heading text-3xl sm:text-6xl font-black tracking-tight">
            Which SoundReady plan is <span className="text-primary">right for you</span>?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Watch what each plan actually covers, then choose. Here's how to choose your plan.
          </p>
        </motion.div>

        <ScenePlayer
          scenes={PLAN_VSL_SCENES}
          title="Which SoundReady plan is right for you"
          logo={<SoundReadyLogo size={18} />}
          playLabel="Watch: what Free, Artist Pro and Digital Manager each cover"
        />
      </div>
    </section>
  );
}