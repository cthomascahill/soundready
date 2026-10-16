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
    <section className="px-4 pb-16 pt-2 scroll-mt-20" id="plan-vsl">
      <div className="max-w-5xl mx-auto">
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