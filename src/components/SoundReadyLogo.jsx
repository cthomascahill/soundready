export default function SoundReadyLogo({ size = 28 }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="srPlayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="srShineGrad" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Green rounded triangle play button */}
        <rect x="8" y="8" width="84" height="84" rx="16" fill="url(#srPlayGrad)" stroke="#15803d" strokeWidth="2" />
        {/* Triangle cutout */}
        <path d="M28 32 L72 50 L28 68 Z" fill="black" />
        {/* Gloss shine */}
        <path d="M15 15 Q35 25 25 50 Q20 35 15 25 Z" fill="url(#srShineGrad)" />
        {/* White upward arrow */}
        <path d="M45 68 L70 43 M70 43 L58 55 M70 43 L70 28" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-heading font-bold" style={{ fontSize: size * 0.7 }}>
        <span className="text-white">sound</span><span className="text-primary">ready</span>
      </span>
    </div>
  );
}