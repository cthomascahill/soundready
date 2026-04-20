export default function SoundReadyLogo({ size = 28 }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="srPlayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4444" />
            <stop offset="100%" stopColor="#cc0000" />
          </linearGradient>
          <linearGradient id="srShineGrad" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.45" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Rounded triangle play button */}
        <path d="M10 8 L92 50 L10 92 Z" fill="url(#srPlayGrad)" stroke="#880000" strokeWidth="3" strokeLinejoin="round" />
        {/* Gloss shine */}
        <path d="M10 8 L92 50 L10 92 Z" fill="url(#srShineGrad)" />
        {/* Upward arrow */}
        <path d="M28 63 L52 39 M52 39 L52 51 M52 39 L40 39" stroke="white" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-heading font-bold" style={{ fontSize: size * 0.64 }}>
        <span className="text-primary">Sound</span>
        <span className="text-foreground">Ready</span>
      </span>
    </div>
  );
}