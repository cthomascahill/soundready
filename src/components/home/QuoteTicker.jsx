import { QUOTES } from "@/lib/homeQuotes";

// A quiet, right-to-left stream of attributed quotes on systems and
// consistent creative work, closing the homepage just above the footer.
// The marquee animation pauses for visitors who prefer reduced motion
// (handled in index.css); the quotes stay fully readable either way.
export default function QuoteTicker() {
  // Rendering the list twice makes the loop seamless.
  const doubled = [...QUOTES, ...QUOTES];

  return (
    <section aria-label="Words on systems and creative habits" className="py-14 border-t border-border/60">
      <div className="max-w-[1400px] mx-auto px-4">
        <p className="text-center text-xs text-primary uppercase tracking-wider font-bold mb-8">
          Why systems win
        </p>
      </div>
      <div className="quote-marquee overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="quote-marquee-track flex w-max items-center gap-10 py-2 pr-10">
          {doubled.map((q, i) => (
            <figure key={i} className="flex items-baseline gap-3 whitespace-nowrap">
              <blockquote className="font-heading text-lg sm:text-xl font-medium text-foreground/90">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <figcaption className="text-sm text-muted-foreground shrink-0">
                {q.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}