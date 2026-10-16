import { ArrowDown } from "lucide-react";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import ScenePlayer from "@/components/home/vsl/ScenePlayer";
import { PLAN_VSL_SCENES } from "@/components/pricing/planVslScenes";

/**
 * The pricing-page VSL: a narrated walkthrough of each plan, what Free
 * actually covers, the full Artist Pro workspace, and what Digital Manager
 * and its 2,500 monthly credits do for you, ending on how to start.
 */
export default function PlanVslSection() {
  return (
    <section className="px-4 pb-16 pt-2 scroll-mt-20" id="plan-vsl">
      <div className="max-w-5xl mx-auto">
        {/* Ready buyers jump straight past the video to the plan cards */}
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:opacity-80 transition-opacity"
          >
            See plans &amp; prices <ArrowDown className="h-4 w-4" />
          </button>
        </div>
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