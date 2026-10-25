import React from 'react';

interface RoomShellSvgProps {
  temperatureHue?: string; // Subtle tint based on temp
}

export const RoomShellSvg: React.FC<RoomShellSvgProps> = ({ temperatureHue }) => {
  return (
    <g className="room-shell">
      {/* Ambient Gradient Definitions */}
      <defs>
        {/* Left Wall Gradient */}
        <linearGradient id="leftWallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a2434" />
          <stop offset="100%" stopColor="#111824" />
        </linearGradient>

        {/* Right Wall Gradient */}
        <linearGradient id="rightWallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#222e42" />
          <stop offset="100%" stopColor="#151e2c" />
        </linearGradient>

        {/* Floor Gradient */}
        <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e2a3a" />
          <stop offset="100%" stopColor="#0f1722" />
        </linearGradient>

        {/* Window Sky Glow */}
        <linearGradient id="windowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Floor Polygon */}
      <polygon
        points="400,240 680,380 400,520 120,380"
        fill="url(#floorGrad)"
        stroke="#2d3b4e"
        strokeWidth="1.5"
      />

      {/* Subtle Floor Tile Grid Lines */}
      <g stroke="#1b2533" strokeWidth="1" opacity="0.6">
        <line x1="330" y1="275" x2="610" y2="415" />
        <line x1="260" y1="310" x2="540" y2="450" />
        <line x1="190" y1="345" x2="470" y2="485" />
        <line x1="470" y1="275" x2="190" y2="415" />
        <line x1="540" y1="310" x2="260" y2="450" />
        <line x1="610" y1="345" x2="330" y2="485" />
      </g>

      {/* Left Wall Polygon */}
      <polygon
        points="120,380 120,160 400,40 400,240"
        fill="url(#leftWallGrad)"
        stroke="#2d3b4e"
        strokeWidth="1.5"
      />

      {/* Right Wall Polygon */}
      <polygon
        points="400,240 400,40 680,160 680,380"
        fill="url(#rightWallGrad)"
        stroke="#2d3b4e"
        strokeWidth="1.5"
      />

      {/* Back Corner Crease Line */}
      <line x1="400" y1="40" x2="400" y2="240" stroke="#334155" strokeWidth="2" />

      {/* Door on Left Wall */}
      <g transform="translate(150, 240)">
        <polygon
          points="0,90 0,0 50,-25 50,65"
          fill="#111827"
          stroke="#374151"
          strokeWidth="1.5"
        />
        {/* Door Knob */}
        <circle cx="40" cy="25" r="2.5" fill="#9ca3af" />
      </g>

      {/* Window on Right Wall */}
      <g transform="translate(480, 110)">
        <polygon
          points="0,0 120,60 120,130 0,70"
          fill="url(#windowGlow)"
          stroke="#475569"
          strokeWidth="2"
        />
        {/* Window Crossbar */}
        <line x1="60" y1="30" x2="60" y2="100" stroke="#475569" strokeWidth="1.5" />
        <line x1="0" y1="35" x2="120" y2="95" stroke="#475569" strokeWidth="1.5" />
      </g>

      {/* Minimalist Bed in Corner */}
      <g transform="translate(450, 290)">
        {/* Mattress Base */}
        <polygon
          points="50,-25 150,25 100,60 0,10"
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="1"
        />
        {/* Pillow */}
        <polygon
          points="40,-15 70,0 55,10 25,-5"
          fill="#e2e8f0"
          opacity="0.8"
        />
        {/* Blanket Overlay */}
        <polygon
          points="60,0 150,25 100,60 30,30"
          fill="#0284c7"
          opacity="0.75"
        />
      </g>

      {/* Minimalist Study Desk & Chair */}
      <g transform="translate(230, 310)">
        {/* Desk Top */}
        <polygon
          points="0,20 70,-15 110,5 40,40"
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="1.5"
        />
        {/* Desk Legs */}
        <line x1="0" y1="20" x2="0" y2="55" stroke="#334155" strokeWidth="2" />
        <line x1="40" y1="40" x2="40" y2="75" stroke="#334155" strokeWidth="2" />
        <line x1="110" y1="5" x2="110" y2="40" stroke="#334155" strokeWidth="2" />
        {/* Laptop on desk */}
        <polygon points="35,15 55,5 65,12 45,22" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />
      </g>

      {/* Temperature Hue Ambience Overlay (subtle wash) */}
      {temperatureHue && (
        <polygon
          points="400,40 680,160 680,380 400,520 120,380 120,160"
          fill={temperatureHue}
          opacity="0.08"
          pointerEvents="none"
        />
      )}
    </g>
  );
};
