import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const SAM_IMG = "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/b1abb1260_IMG_3924.png";

/** AI Manager upsell on the EPK Builder: Sam can send this kit out for the artist. */
export default function EpkUpsellCard() {
  return (
    <div className="relative rounded-2xl border border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row items-center gap-4 overflow-hidden">
      <img src={SAM_IMG} alt="Sam, the SoundReady AI manager robot" className="h-20 w-auto drop-shadow-lg shrink-0" />
      <div className="flex-1 text-center sm:text-left space-y-1">
        <p className="font-heading font-bold">Sam can pitch this out for you automatically with AI Manager.</p>
        <p className="text-xs text-muted-foreground">
          Sam finds your saved EPK in Storage and attaches it to every pitch it sends on your behalf.
        </p>
      </div>
      <Link to="/checkout/ai-manager" className="shrink-0">
        <Button className="gap-2 font-semibold">
          Upgrade to AI Manager <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}