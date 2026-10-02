import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

// Animates a stat like "+200%" or "10+ hrs" from zero when scrolled into view
export default function CountUpStat({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const match = value.match(/^([^\d]*)([\d.,]+)(.*)$/s);
  const [display, setDisplay] = useState(match ? "0" : value);

  useEffect(() => {
    if (!inView || !match) return;
    const target = parseFloat(match[2].replace(/,/g, ""));
    const controls = animate(0, target, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v).toLocaleString()),
    });
    return () => controls.stop();
  }, [inView]);

  return (
    <p ref={ref} className="font-heading text-5xl font-black text-primary">
      {match ? `${match[1]}${display}${match[3]}` : value}
    </p>
  );
}