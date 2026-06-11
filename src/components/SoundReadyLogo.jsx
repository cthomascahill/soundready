export default function SoundReadyLogo({ size = 32 }) {
  const h = size;
  const w = size * 1.1;

  return (
    <div className="flex items-center gap-2.5">
      <svg width={w} height={h} viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2ecc71" />
            <stop offset="100%" stopColor="#1a9e50" />
          </linearGradient>
          <linearGradient id="shadowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f5e2e" />
            <stop offset="100%" stopColor="#0a3d1e" />
          </linearGradient>
        </defs>
        {/* Shadow/offset layer */}
        <path d="M10 92 L70 92 L108 50 L70 8 L10 8 Z" fill="#0a3d1e" transform="translate(3,4)" />
        {/* Main play-button shape */}
        <path d="M10 90 L68 90 L106 50 L68 10 L10 10 Z" fill="url(#bgGrad)" />
        {/* Dark left half overlay for depth */}
        <path d="M10 90 L38 90 L38 10 L10 10 Z" fill="#1a9e50" opacity="0.5" />
        {/* White trending-up arrow */}
        <path
          d="M22 72 L50 44 L58 60 L78 36 M78 36 L78 50 M78 36 L64 36"
          stroke="white"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      <span className="font-heading font-black tracking-tight" style={{ fontSize: size * 0.62 }}>
        <span className="text-white">sound</span><span className="text-primary">ready</span>
      </span>
    </div>
  );
}