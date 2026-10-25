import React from 'react';

interface FanDropTargetProps {
  isOver: boolean;
  isPlaced: boolean;
  onDrop: () => void;
}

export const FanDropTarget: React.FC<FanDropTargetProps> = ({
  isOver,
  isPlaced,
  onDrop,
}) => {
  return (
    <g
      id="fan-drop-target-area"
      transform="translate(400, 175)"
      onClick={onDrop}
      className={`fan-drop-target ${isOver ? 'is-active-target' : ''} ${
        isPlaced ? 'is-occupied-target' : ''
      }`}
    >
      {/* Target indicator ring */}
      <circle
        cx="0"
        cy="0"
        r={isOver ? 24 : 18}
        fill={isOver ? 'rgba(6, 182, 212, 0.25)' : 'transparent'}
        stroke={isOver ? '#06b6d4' : isPlaced ? '#ef4444' : '#64748b'}
        strokeWidth={isOver ? 2.5 : 1.5}
        strokeDasharray={isPlaced ? 'none' : '4 3'}
        className="transition-all duration-200"
      />
      <circle cx="0" cy="0" r="3" fill={isPlaced ? '#ef4444' : '#06b6d4'} />
    </g>
  );
};
