interface FileUploadIconProps {
  width?: number;
  height?: number;
}

function FileUploadIcon({ width = 64, height = 64 }: FileUploadIconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 64 64" fill="none">
      <rect
        x="12"
        y="16"
        width="40"
        height="32"
        rx="2"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <circle cx="32" cy="28" r="4" fill="#3B82F6" />
      <path
        d="M12 40L20 32L28 40L40 28L52 40"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default FileUploadIcon;
