// Sam — Soundready Artist Manager. The little cream robot with a green
// pixel face, matching the official character art.
const CREAM = "#F0EEE9";
const MATTE = "#2B2B2B";
const GLOW = "#89FF70";

export default function SamLogo({ className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      role="img"
      aria-label="Sam, Soundready Artist Manager"
    >
      {/* Antenna with glowing ring */}
      <circle cx="21" cy="4" r="2.2" stroke={GLOW} strokeWidth="1.6" />
      <line x1="21.5" y1="6.2" x2="22" y2="9" stroke={MATTE} strokeWidth="1.4" strokeLinecap="round" />
      {/* Head */}
      <rect x="9" y="8" width="30" height="17" rx="8.5" fill={CREAM} stroke={MATTE} strokeWidth="1.2" />
      {/* Ear lights */}
      <circle cx="9" cy="16.5" r="1.7" fill={GLOW} />
      <circle cx="39" cy="16.5" r="1.7" fill={GLOW} />
      {/* Glass visor */}
      <rect x="12.5" y="11" width="23" height="11" rx="5.5" fill="#111" />
      {/* Pixel eyes + smile */}
      <path d="M16.5 14.6 q1.8 -2 3.6 0" stroke={GLOW} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M27.9 14.6 q1.8 -2 3.6 0" stroke={GLOW} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20 18 q4 2.4 8 0" stroke={GLOW} strokeWidth="1.6" strokeLinecap="round" />
      {/* Body */}
      <rect x="11.5" y="25.5" width="25" height="19" rx="7.5" fill={CREAM} stroke={MATTE} strokeWidth="1.2" />
      {/* Chest badge */}
      <text
        x="24"
        y="34"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="7.5"
        fontWeight="700"
        letterSpacing="0.5"
        fill={MATTE}
        fontFamily="inherit"
      >
        SAM
      </text>
      <rect x="20.5" y="38.2" width="7" height="1.6" rx="0.8" fill={GLOW} />
    </svg>
  );
}