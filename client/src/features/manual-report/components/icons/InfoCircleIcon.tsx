interface InfoCircleIconProps {
  width?: number;
  height?: number;
}

function InfoCircleIcon({ width = 14, height = 14 }: InfoCircleIconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <circle
        cx="7"
        cy="7"
        r="6"
        stroke="#22C55E"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M7 4V7.5M7 10H7.01"
        stroke="#22C55E"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default InfoCircleIcon;
