import React from 'react';

/**
 * FRACTURE Wordmark: Inter Bold, weight 700, uppercase, letter-spacing -0.02em, line-height 1.
 * Desktop target: ~40-44px.
 */
export const FractureLogo: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => {
  return (
    <span
      className={`font-sans font-bold tracking-[-0.02em] leading-none uppercase text-white select-none inline-block ${className}`}
      style={style}
    >
      FRACTURE
    </span>
  );
};

export const WisaLogo = FractureLogo;

/**
 * Atelier Shattered Shard / Fractured Metallurgy Emblem: 71x43 viewBox.
 */
export const AtelierIcon: React.FC<{ className?: string }> = ({ className = 'w-[71px] h-[43px]' }) => {
  return (
    <svg
      viewBox="0 0 71 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer faceted brutalist polygon */}
      <polygon points="35.5,2 69,21.5 35.5,41 2,21.5" stroke="white" strokeWidth="1" />
      {/* Central fracture axis */}
      <line x1="35.5" y1="2" x2="35.5" y2="41" stroke="white" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="2" y1="21.5" x2="69" y2="21.5" stroke="white" strokeWidth="1" />
      {/* Angular impact diagonals */}
      <line x1="16" y1="10" x2="55" y2="33" stroke="white" strokeWidth="1" />
      <line x1="55" y1="10" x2="16" y2="33" stroke="white" strokeWidth="1" />
      {/* Inner faceted diamond */}
      <polygon points="35.5,12 48,21.5 35.5,31 23,21.5" stroke="white" strokeWidth="1" />
    </svg>
  );
};

export const GlobeIcon = AtelierIcon;
