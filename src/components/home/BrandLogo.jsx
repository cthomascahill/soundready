import React from "react";

// Simplified brand marks drawn as inline SVGs so they never depend on an
// external CDN. Each is paired with the brand's name underneath in the UI.

const S = ({ children, className }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    {children}
  </svg>
);

export default function BrandLogo({ name, className = "h-7 w-7" }) {
  switch (name) {
    case "Dropbox":
      return (
        <S className={className}>
          <g fill="#0061FE">
            <polygon points="6,2 12,6 6,10 0,6" />
            <polygon points="18,2 24,6 18,10 12,6" />
            <polygon points="6,10 12,14 6,18 0,14" />
            <polygon points="18,10 24,14 18,18 12,14" />
            <polygon points="12,16 18,20 12,24 6,20" />
          </g>
        </S>
      );
    case "Google Drive":
      return (
        <S className={className}>
          <path
            fill="#4285F4"
            d="M8.7 2h6.6c.7 0 1.4.4 1.7 1l6.5 11.2c.4.6.4 1.4 0 2l-3.5 6.1c-.4.6-1 1-1.7 1H5.7c-.7 0-1.4-.4-1.7-1L.5 16.2c-.4-.6-.4-1.4 0-2L7 3c.4-.6 1-1 1.7-1z"
          />
        </S>
      );
    case "WeTransfer":
      return (
        <S className={className}>
          <text x="1" y="17" fontSize="13" fontWeight="700" fill="#ffffff" fontFamily="Arial, sans-serif">
            We–
          </text>
        </S>
      );
    case "Gmail":
      return (
        <S className={className}>
          <rect x="1.5" y="5" width="21" height="14" rx="2.5" fill="#EA4335" />
          <path d="M3.5 7.5l8.5 6 8.5-6" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </S>
      );
    case "Google Sheets":
      return (
        <S className={className}>
          <path fill="#0F9D58" d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
          <path fill="#0b7a43" d="M15 2l5 5h-5z" />
          <g fill="#ffffff">
            <rect x="8" y="11" width="8" height="1.6" rx="0.4" />
            <rect x="8" y="14.4" width="8" height="1.6" rx="0.4" />
            <rect x="8" y="17.8" width="5" height="1.6" rx="0.4" />
          </g>
        </S>
      );
    case "Notion":
      return (
        <S className={className}>
          <rect x="2" y="2" width="20" height="20" rx="4" fill="none" stroke="#ffffff" strokeWidth="1.6" />
          <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="700" fill="#ffffff" fontFamily="Georgia, serif">
            N
          </text>
        </S>
      );
    case "Trello":
      return (
        <S className={className}>
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#0079BF" />
          <rect x="5" y="5" width="4.5" height="10" rx="1.2" fill="#ffffff" />
          <rect x="11.5" y="5" width="4.5" height="7" rx="1.2" fill="#ffffff" />
        </S>
      );
    case "Google Keep":
      return (
        <S className={className}>
          <circle cx="12" cy="10" r="7" fill="#FFBB00" />
          <rect x="9.5" y="16.5" width="5" height="2" rx="1" fill="#FFBB00" />
          <rect x="10.5" y="19.5" width="3" height="2" rx="1" fill="#FFBB00" />
        </S>
      );
    case "Voice Memos":
      return (
        <S className={className}>
          <rect x="2" y="2" width="20" height="20" rx="5" fill="#D93025" />
          <g fill="#ffffff">
            <rect x="5.5" y="10" width="1.8" height="4" rx="0.9" />
            <rect x="8.5" y="8" width="1.8" height="8" rx="0.9" />
            <rect x="11.5" y="6" width="1.8" height="12" rx="0.9" />
            <rect x="14.5" y="9" width="1.8" height="6" rx="0.9" />
            <rect x="17.5" y="10.5" width="1.8" height="3" rx="0.9" />
          </g>
        </S>
      );
    case "Slack":
      return (
        <S className={className}>
          <rect x="9" y="1.5" width="4" height="9" rx="2" fill="#36C5F0" />
          <rect x="14" y="9" width="9" height="4" rx="2" fill="#2EB67D" />
          <rect x="11" y="13.5" width="4" height="9" rx="2" fill="#ECB22E" />
          <rect x="1" y="11" width="9" height="4" rx="2" fill="#E01E5A" />
        </S>
      );
    case "Google":
      return (
        <S className={className}>
          <text x="12" y="18" textAnchor="middle" fontSize="18" fontWeight="700" fill="#4285F4" fontFamily="Arial, sans-serif">
            G
          </text>
        </S>
      );
    case "Instagram DMs":
      return (
        <S className={className}>
          <rect x="3" y="3" width="18" height="18" rx="5.5" fill="none" stroke="#E1306C" strokeWidth="2" />
          <circle cx="12" cy="12" r="4.4" fill="none" stroke="#E1306C" strokeWidth="2" />
          <circle cx="17.3" cy="6.7" r="1.3" fill="#E1306C" />
        </S>
      );
    default:
      return null;
  }
}