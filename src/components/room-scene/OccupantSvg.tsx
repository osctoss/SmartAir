import React from 'react';

interface OccupantSvgProps {
  occupancyCount: number;
}

export const OccupantSvg: React.FC<OccupantSvgProps> = ({ occupancyCount }) => {
  if (occupancyCount <= 0) return null;

  return (
    <g id="scene-occupants" className="transition-all duration-300">
      {/* Person 1: Seated at the study desk working on PC */}
      <g transform="translate(265, 315)">
        {/* Chair backrest */}
        <polygon
          points="-5,0 15,-10 20,-30 0,-20"
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Torso / Shoulders in subtle cyan silhouette */}
        <path
          d="M 5 -10 Q 15 -25 25 -12 L 20 10 Q 10 15 2 8 Z"
          fill="#0e7490"
          stroke="#22d3ee"
          strokeWidth="1"
          opacity="0.9"
        />

        {/* Head */}
        <circle
          cx="14"
          cy="-30"
          r="7"
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth="1"
          opacity="0.95"
        />

        {/* Arm reaching toward laptop */}
        <path
          d="M 18 -10 Q 25 -2 30 5"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Presence glow aura */}
        <ellipse cx="14" cy="12" rx="14" ry="7" fill="#06b6d4" opacity="0.15" />
      </g>

      {/* Person 2 (if occupancyCount >= 2): Standing in room */}
      {occupancyCount >= 2 && (
        <g transform="translate(410, 365)" className="animate-in fade-in duration-200">
          {/* Shadow */}
          <ellipse cx="0" cy="20" rx="15" ry="6" fill="#000000" opacity="0.3" />

          {/* Legs */}
          <line x1="-3" y1="5" x2="-5" y2="20" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          <line x1="4" y1="5" x2="6" y2="20" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />

          {/* Torso */}
          <path
            d="M -7 -18 L 7 -18 L 5 6 L -5 6 Z"
            fill="#4338ca"
            stroke="#818cf8"
            strokeWidth="1"
          />

          {/* Head */}
          <circle
            cx="0"
            cy="-27"
            r="7"
            fill="#a5b4fc"
            stroke="#6366f1"
            strokeWidth="1"
          />
        </g>
      )}

      {/* Person 3+ (if occupancyCount >= 3) */}
      {occupancyCount >= 3 && (
        <g transform="translate(350, 410)" className="animate-in fade-in duration-200">
          <ellipse cx="0" cy="18" rx="13" ry="5" fill="#000000" opacity="0.3" />
          <line x1="-3" y1="4" x2="-4" y2="18" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="3" y1="4" x2="4" y2="18" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M -6 -16 L 6 -16 L 4 5 L -4 5 Z"
            fill="#059669"
            stroke="#34d399"
            strokeWidth="1"
          />
          <circle
            cx="0"
            cy="-24"
            r="6.5"
            fill="#6ee7b7"
            stroke="#10b981"
            strokeWidth="1"
          />
        </g>
      )}
    </g>
  );
};
