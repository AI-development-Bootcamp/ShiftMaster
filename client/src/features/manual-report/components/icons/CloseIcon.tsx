interface CloseIconProps {
  width?: number;
  height?: number;
}

function CloseIcon({ width = 24, height = 24 }: CloseIconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <path
        d="M18 6L6 18M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default CloseIcon;
