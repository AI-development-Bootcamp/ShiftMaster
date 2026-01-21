interface CheckIconProps {
  width?: number;
  height?: number;
}

function CheckIcon({ width = 20, height = 20 }: CheckIconProps) {
  return (
    <svg
      className="check-icon"
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
    >
      <circle cx="10" cy="10" r="10" fill="#3B82F6" />
      <path
        d="M6 10L9 13L14 7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default CheckIcon;
