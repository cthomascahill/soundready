export default function SoundReadyLogo({ size = 32 }) {
  const h = size;
  const w = size * 1.1;

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={w}
        height={h}
        viewBox="0 0 110 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-foreground"
        aria-label="SoundReady"
      >
        {/* Robot head outline */}
        <rect x="26" y="24" width="52" height="52" rx="14" stroke="currentColor" strokeWidth="6" />
        {/* Ears, small oval eyes and smile in the site green */}
        <g className="text-primary" fill="currentColor" stroke="currentColor">
          <path d="M26 43 A8 8 0 0 0 26 59 Z" />
          <path d="M78 43 A8 8 0 0 1 78 59 Z" />
          <ellipse cx="45" cy="47" rx="5" ry="3.5" stroke="none" />
          <ellipse cx="65" cy="47" rx="5" ry="3.5" stroke="none" />
          <path d="M46 61 a8 5.5 0 0 0 16 0" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
        {/* Growth arrow from the top right */}
        <path
          d="M74 26 C 86 23, 94 17, 100 8 M100 8 L88 9 M100 8 L96 19"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="font-heading font-black tracking-tight" style={{ fontSize: size * 0.62 }}>
        <span className="text-foreground">sound</span><span className="text-primary">ready</span>
      </span>
    </div>
  );
}