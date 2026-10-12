export default function SoundReadyLogo({ size = 32 }) {
  const h = size;
  const w = size * 1.1;

  return (
    <div className="flex items-center gap-2.5">
      <svg width={w} height={h} viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#35e273" />
            <stop offset="100%" stopColor="#14b050" />
          </linearGradient>
        </defs>
        {/* Rounded play triangle */}
        <path
          d="M24 22 L24 78 L88 50 Z"
          fill="url(#bgGrad)"
          stroke="url(#bgGrad)"
          strokeWidth="14"
          strokeLinejoin="round"
        />
        {/* Curved white arrow sweeping up to the upper right */}
        <path
          d="M30 74 C 48 67, 62 58, 79 34 M79 34 L75 49 M79 34 L66 35"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      <span className="font-heading font-black tracking-tight" style={{ fontSize: size * 0.62 }}>
        <span className="text-foreground">sound</span><span className="text-primary">ready</span>
      </span>
    </div>
  );
}