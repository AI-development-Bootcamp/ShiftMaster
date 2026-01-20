interface FileIconProps {
  width?: number;
  height?: number;
}

function FileIcon({ width = 40, height = 40 }: FileIconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 40 40" fill="none">
      <rect
        width="40"
        height="40"
        rx="8"
        fill="#3B82F6"
        fillOpacity="0.1"
      />
      <path
        d="M20 12V20M20 20V28M20 20H28M20 20H12"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default FileIcon;
