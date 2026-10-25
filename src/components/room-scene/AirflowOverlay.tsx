import React from 'react';
import { FanSpeed } from '@/domain/types';

interface AirflowOverlayProps {
  speed: FanSpeed;
}

export const AirflowOverlay: React.FC<AirflowOverlayProps> = ({ speed }) => {
  if (speed === 'off') return null;

  const strokeWidth = speed === 'high' ? 2 : speed === 'medium' ? 1.5 : 1;
  const opacity = speed === 'high' ? 0.75 : speed === 'medium' ? 0.5 : 0.35;

  return (
    <g id="fan-airflow-overlay" opacity={opacity}>
      {/* Downward cone airflow paths from (400, 150) */}
      <path
        d="M 380 150 C 370 210, 310 280, 270 360"
        fill="none"
        stroke="#38bdf8"
        strokeWidth={strokeWidth}
        strokeDasharray="8 6"
        className="airflow-active"
      />
      <path
        d="M 400 155 C 400 230, 390 320, 380 410"
        fill="none"
        stroke="#38bdf8"
        strokeWidth={strokeWidth}
        strokeDasharray="10 8"
        className="airflow-active"
      />
      <path
        d="M 420 150 C 430 210, 490 280, 530 360"
        fill="none"
        stroke="#38bdf8"
        strokeWidth={strokeWidth}
        strokeDasharray="8 6"
        className="airflow-active"
      />
      {/* Circulation loop */}
      <path
        d="M 280 340 C 240 370, 210 320, 260 280"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="1"
        strokeDasharray="6 6"
        opacity="0.4"
        className="airflow-active"
      />
      <path
        d="M 520 340 C 560 370, 590 320, 540 280"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="1"
        strokeDasharray="6 6"
        opacity="0.4"
        className="airflow-active"
      />
    </g>
  );
};
