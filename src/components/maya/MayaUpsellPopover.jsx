import { X, Sparkles, Lock } from "lucide-react";
import SamLogo from "@/components/SamLogo";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function MayaUpsellPopover({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.95 }}
        transition={{ type: "spring", damping: 24, stiffness: 300 }}
        className="fixed bottom-20 right-6 z-50 w-[300px] rounded-2xl bg-popover border border-border shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 8px 60px rgba(0,0,0,0.7), 0 0 40px rgba(34,197,94,0.08)" }}
      >
        {/* Dismiss */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-6 w-6 rounded-md bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Avatar */}
        <div className="flex flex-col items-center pt-7 pb-5 px-5 text-center">
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/30 to-emerald-600/20 border border-primary/30 flex items-center justify-center">
              <SamLogo className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-popover border border-border flex items-center justify-center">
              <Lock className="h-2.5 w-2.5 text-muted-foreground" />
            </div>
          </div>

          <p className="font-heading font-bold text-foreground text-base mb-1">Chat with Sam, your AI manager</p>

          {/* Sam speaking in first person */}
          <div className="space-y-2 mt-3 text-left">
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              I know your Spotify numbers, your city, your sound.
            </p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              I find you gigs, pitch your music to playlists, and tell you exactly what to move on next.
            </p>
            <p className="text-[13px] text-foreground/80 leading-relaxed font-medium">
              I'm your manager — always on, always watching.
            </p>
          </div>

          {/* CTA */}
          <Link
            to="/pricing-account"
            onClick={onClose}
            className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-black font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to AI Manager — $60/mo
          </Link>

          <p className="text-[10px] text-muted-foreground mt-2">Cancel anytime · Unlimited Sam access</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}