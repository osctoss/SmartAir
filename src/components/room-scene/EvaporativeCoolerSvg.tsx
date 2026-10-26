import React from 'react';

interface EvaporativeCoolerSvgProps {
  enabled: boolean;
}

export const EvaporativeCoolerSvg: React.FC<EvaporativeCoolerSvgProps> = ({ enabled }) => {
  return (
    <g transform="translate(560, 240)" id="evaporative-cooler-unit">
      {/* Base shadow */}
      <ellipse cx="25" cy="85" rx="30" ry="12" fill="#000000" opacity="0.35" />

      {/* Main Cooler Cabinet (Isometric Box) */}
      {/* Front Face */}
      <polygon
        points="0,20 35,38 35,80 0,62"
        fill="#1e293b"
        stroke="#334155"
        strokeWidth="1.5"
      />

      {/* Right Side Face */}
      <polygon
        points="35,38 65,22 65,64 35,80"
        fill="#0f172a"
        stroke="#334155"
        strokeWidth="1.5"
      />

      {/* Top Face */}
      <polygon
        points="0,20 30,5 65,22 35,38"
        fill="#334155"
        stroke="#475569"
        strokeWidth="1.5"
      />

      {/* Front Louvers / Grille */}
      <line x1="6" y1="35" x2="30" y2="48" stroke="#475569" strokeWidth="1.5" />
      <line x1="6" y1="42" x2="30" y2="55" stroke="#475569" strokeWidth="1.5" />
      <line x1="6" y1="49" x2="30" y2="62" stroke="#475569" strokeWidth="1.5" />
      <line x1="6" y1="56" x2="30" y2="69" stroke="#475569" strokeWidth="1.5" />

      {/* Water Level Gauge Window */}
      <rect
        x="42"
        y="45"
        width="14"
        height="18"
        rx="2"
        fill={enabled ? '#0ea5e9' : '#0369a1'}
        opacity="0.8"
        stroke="#38bdf8"
        strokeWidth="1"
      />

      {/* Active Cooling Mist / Airflow Stream */}
      {enabled && (
        <g opacity="0.75" className="animate-pulse">
          <path
            d="M -10 30 Q -30 20 -45 35"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeDasharray="4 3"
            fill="none"
          />
          <path
            d="M -5 45 Q -25 40 -40 55"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="4 3"
            fill="none"
          />
          <circle cx="15" cy="18" r="3" fill="#34d399" />
        </g>
      )}

      {/* Indicator LED */}
      <circle cx="15" cy="18" r="2" fill={enabled ? '#10b981' : '#64748b'} />
    </g>
  );
};
