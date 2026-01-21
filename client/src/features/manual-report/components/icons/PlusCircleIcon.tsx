interface PlusCircleIconProps {
  width?: number;
  height?: number;
}

function PlusCircleIcon({ width = 20, height = 20 }: PlusCircleIconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <circle
        cx="10"
        cy="10"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M10 6V14M6 10H14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default PlusCircleIcon;
