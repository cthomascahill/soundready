import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const PHOTO = "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/9ffb729f3_ab6761610000e5eba1986cff464ac2a60440b619.jpeg";

const QUOTES = [
  "Sam successfully booked me 36 shows across 2026.",
  "Sam got me on over 320 playlists so far just this year.",
];

export default function TestimonialSection() {
  return (
    <section className="px-4 pb-16">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative py-8 text-center">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/15 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
          <div className="relative text-center space-y-7">
            <div className="h-24 w-24 sm:h-28 sm:w-28 mx-auto rounded-full overflow-hidden ring-2 ring-primary/60 shadow-xl shadow-primary/20">
              <img src={PHOTO} alt="Matt Corman" className="h-full w-full object-cover" />
            </div>
            <div className="space-y-1">
              <p className="font-heading font-black text-xl">Matt Corman</p>
              <p className="text-sm font-semibold text-primary">1.2 million monthly listeners</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {QUOTES.map((q) => (
                <div key={q} className="flex gap-3 text-left">
                  <Quote className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}