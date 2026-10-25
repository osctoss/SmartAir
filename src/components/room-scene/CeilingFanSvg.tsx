import React from 'react';
import { FanSpeed } from '@/domain/types';

interface CeilingFanSvgProps {
  speed: FanSpeed;
  fanDeviceId: string;
  hasAbnormalLoad?: boolean;
  onClick?: () => void;
}

export const CeilingFanSvg: React.FC<CeilingFanSvgProps> = ({
  speed,
  fanDeviceId,
  hasAbnormalLoad = false,
  onClick,
}) => {
  const durationBySpeed: Record<FanSpeed, string | null> = {
    off: null,
    low: '1.2s',
    medium: '0.6s',
    high: '0.28s',
  };

  const duration = durationBySpeed[speed];
  const isSpinning = duration !== null;

  return (
    <g
      id="ceiling-fan-assembly"
      className="cursor-pointer group"
      onClick={onClick}
      transform="translate(400, 130)"
    >
      {/* Ceiling Mount Canopy & Downrod */}
      <polygon points="-12,-40 12,-40 6,-15 -6,-15" fill="#334155" stroke="#475569" strokeWidth="1" />
      <line x1="0" y1="-40" x2="0" y2="0" stroke="#64748b" strokeWidth="3.5" />

      {/* Rotating Blades Container */}
      <g
        className={isSpinning ? 'fan-spinning' : ''}
        style={{ '--fan-duration': duration } as React.CSSProperties}
      >
        {/* Blade 1 (0 deg) */}
        <path
          d="M 0 0 C 10 -8, 65 -15, 85 -5 C 90 -2, 85 8, 75 10 C 50 12, 10 4, 0 0 Z"
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="1.2"
        />

        {/* Blade 2 (120 deg) */}
        <g transform="rotate(120)">
          <path
            d="M 0 0 C 10 -8, 65 -15, 85 -5 C 90 -2, 85 8, 75 10 C 50 12, 10 4, 0 0 Z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="1.2"
          />
        </g>

        {/* Blade 3 (240 deg) */}
        <g transform="rotate(240)">
          <path
            d="M 0 0 C 10 -8, 65 -15, 85 -5 C 90 -2, 85 8, 75 10 C 50 12, 10 4, 0 0 Z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="1.2"
          />
        </g>
      </g>

      {/* Center Motor Hub */}
      <circle
        cx="0"
        cy="0"
        r="14"
        fill={hasAbnormalLoad ? '#ef4444' : '#0f172a'}
        stroke={hasAbnormalLoad ? '#f87171' : '#38bdf8'}
        strokeWidth="2"
        className={hasAbnormalLoad ? 'animate-pulse' : ''}
      />
      <circle cx="0" cy="0" r="5" fill="#38bdf8" />

      {/* Bottom Anchor / Hook for Virtual Load Attachment */}
      <g id="fan-load-anchor" transform="translate(0, 14)">
        <path
          d="M 0 0 L 0 8 A 4 4 0 0 1 -4 12"
          fill="none"
          stroke={hasAbnormalLoad ? '#ef4444' : '#06b6d4'}
          strokeWidth="2"
        />
        <circle cx="-4" cy="12" r="2" fill={hasAbnormalLoad ? '#ef4444' : '#06b6d4'} />
      </g>

      {/* Fan Device ID Tag on Hover */}
      <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" transform="translate(0, -50)">
        <rect x="-45" y="-12" width="90" height="20" rx="4" fill="#0b0f17" stroke="#06b6d4" strokeWidth="1" />
        <text x="0" y="2" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          {fanDeviceId}
        </text>
      </g>
    </g>
  );
};
