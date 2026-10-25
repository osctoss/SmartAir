import React from 'react';
import { Weight } from 'lucide-react';

interface VirtualLoadObjectProps {
  loadKg: number;
  isPlaced: boolean;
  onRemove: () => void;
  onPlaceKeyboard: () => void;
}

export const VirtualLoadObject: React.FC<VirtualLoadObjectProps> = ({
  loadKg,
  isPlaced,
  onRemove,
  onPlaceKeyboard,
}) => {
  return (
    <>
      {/* In-Scene Placed Weight (Tethered directly to ceiling fan hook) */}
      {isPlaced && (
        <g id="placed-virtual-weight" transform="translate(400, 145)" className="animate-in fade-in duration-200">
          {/* Steel Tether Cable */}
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="60"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="3 2"
          />

          {/* Hanging Load Object */}
          <g transform="translate(0, 60)">
            {/* Top Hook Ring */}
            <circle cx="0" cy="-6" r="5" fill="none" stroke="#f59e0b" strokeWidth="2" />

            {/* Industrial Calibrated Weight Body */}
            <polygon
              points="-18,0 18,0 24,32 -24,32"
              fill="#1e293b"
              stroke="#f59e0b"
              strokeWidth="2"
              filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
            />

            {/* Mass Label */}
            <text
              x="0"
              y="20"
              fill="#fbbf24"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              {loadKg} kg
            </text>
          </g>
        </g>
      )}

      {/* Toolbox Tray Panel (HTML Overlay below SVG Scene) */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-xl bg-[#131b26]/90 border border-slate-700/80 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Weight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              Virtual Load: <span className="font-mono text-amber-400">{loadKg} kg</span>
            </span>
            <span className="text-[11px] text-slate-400 block">
              {isPlaced ? 'Currently tethered to fan mount' : 'Ready in test toolbox'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPlaced ? (
            <button
              onClick={onRemove}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Remove from Fan
            </button>
          ) : (
            <button
              onClick={onPlaceKeyboard}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Place on Fan
            </button>
          )}
        </div>
      </div>
    </>
  );
};
