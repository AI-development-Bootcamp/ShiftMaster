interface WarningTriangleIconProps {
  width?: number;
  height?: number;
}

function WarningTriangleIcon({
  width = 56,
  height = 56,
}: WarningTriangleIconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 56 56" fill="none">
      <rect width="56" height="56" rx="8" fill="#FEF5CC" />
      <path d="M28 18L38 36H18L28 18Z" fill="#945312" />
      <path
        d="M28 26V30M28 32V33"
        stroke="#FEF5CC"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default WarningTriangleIcon;
