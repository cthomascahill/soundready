// Sam — SoundReady Artist Manager. A friendly little robot with an S on its chest.
export default function SamLogo({ className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      role="img"
      aria-label="Sam, SoundReady Artist Manager"
    >
      {/* Antenna */}
      <circle cx="24" cy="4" r="2.5" fill="currentColor" />
      <line x1="24" y1="6.5" x2="24" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Head */}
      <rect x="11" y="10" width="26" height="13" rx="6.5" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="17.5" cy="16.5" r="2" fill="currentColor" />
      <circle cx="30.5" cy="16.5" r="2" fill="currentColor" />
      {/* Neck */}
      <rect x="21.5" y="23" width="5" height="3" rx="1" fill="currentColor" />
      {/* Chest with the S */}
      <rect x="12" y="26" width="24" height="18.5" rx="8" stroke="currentColor" strokeWidth="2.5" />
      <text
        x="24"
        y="35.2"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="15"
        fontWeight="700"
        fill="currentColor"
        fontFamily="inherit"
      >
        S
      </text>
    </svg>
  );
}