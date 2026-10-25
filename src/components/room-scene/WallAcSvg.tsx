import React from 'react';
import { CompressorState, CoolingType } from '@/domain/types';

interface WallAcSvgProps {
  type?: CoolingType;
  enabled: boolean;
  compressorState: CompressorState;
  setpointC?: number;
  onClick?: () => void;
}

export const WallAcSvg: React.FC<WallAcSvgProps> = ({
  type = 'ac',
  enabled,
  compressorState,
  setpointC = 24,
  onClick,
}) => {
  const isCooling = enabled && compressorState === 'cooling';
  const isResting = enabled && compressorState === 'resting';

  return (
    <g
      id="wall-ac-unit"
      className="cursor-pointer group"
      onClick={onClick}
      transform="translate(210, 175)"
    >
      {/* AC Body Box (Isometric Left Wall) */}
      {/* Front Face */}
      <polygon
        points="0,0 80,-40 80,0 0,40"
        fill="#1e293b"
        stroke="#475569"
        strokeWidth="1.5"
      />

      {/* Top Face */}
      <polygon
        points="0,0 20,-10 100,-50 80,-40"
        fill="#334155"
        stroke="#475569"
        strokeWidth="1.5"
      />

      {/* Side Face */}
      <polygon
        points="80,-40 100,-50 100,-10 80,0"
        fill="#0f172a"
        stroke="#475569"
        strokeWidth="1.5"
      />

      {/* Output Louver Flap */}
      <polygon
        points="5,30 75,-5 75,5 5,40"
        fill={isCooling ? '#0369a1' : '#0f172a'}
        stroke={isCooling ? '#38bdf8' : '#334155'}
        strokeWidth="1"
      />

      {/* Status LED & Temperature Display */}
      <g transform="translate(60, -10)">
        <circle
          cx="0"
          cy="0"
          r="3"
          fill={isCooling ? '#38bdf8' : isResting ? '#f59e0b' : '#475569'}
          className={isCooling ? 'animate-pulse' : ''}
        />
        {enabled && (
          <text
            x="8"
            y="3"
            fill="#38bdf8"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {setpointC}°
          </text>
        )}
      </g>

      {/* Cool Air Blower Mist (when active cooling) */}
      {isCooling && (
        <g stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" opacity="0.6">
          <line x1="20" y1="40" x2="60" y2="100" className="airflow-active" />
          <line x1="45" y1="28" x2="85" y2="88" className="airflow-active" />
          <line x1="70" y1="15" x2="110" y2="75" className="airflow-active" />
        </g>
      )}

      {/* Hover Info Tag */}
      <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" transform="translate(40, -45)">
        <rect x="-35" y="-10" width="70" height="18" rx="4" fill="#0b0f17" stroke="#38bdf8" strokeWidth="1" />
        <text x="0" y="3" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">
          {type === 'ac' ? 'SPLIT AC' : 'COOLER'}
        </text>
      </g>
    </g>
  );
};
