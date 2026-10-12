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
        {/* Ears */}
        <path d="M26 41 A10 10 0 0 0 26 61 Z" fill="#00e676" />
        <path d="M78 41 A10 10 0 0 1 78 61 Z" fill="#00e676" />
        {/* Arched eyes */}
        <path
          d="M40 49 a5 5 0 0 1 10 0 M60 49 a5 5 0 0 1 10 0"
          stroke="#00e676"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Smile */}
        <path d="M44 62 a9 6.5 0 0 0 22 0" stroke="#00e676" strokeWidth="5" strokeLinecap="round" />
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
        <span className="text-foreground">sound</span><span className="text-[#00e676]">ready</span>
      </span>
    </div>
  );
}