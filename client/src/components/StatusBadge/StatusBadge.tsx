import './StatusBadge.css';

export type EntryStatus = 'missing' | 'complete' | 'partial' | 'sick' | 'weekend';

interface StatusBadgeProps {
  status: EntryStatus;
  hours?: number;
}

const statusConfig: Record<EntryStatus, { label: string; icon: string }> = {
  missing: { label: 'חסר', icon: 'dot' },
  complete: { label: "ש'", icon: 'check' },
  partial: { label: "ש'", icon: 'warning' },
  sick: { label: 'מחלה', icon: 'dot' },
  weekend: { label: 'סופ"ש', icon: 'dot' },
};

function StatusBadge({ status, hours }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = hours !== undefined ? `${hours} ${config.label}` : config.label;

  const renderIcon = () => {
    switch (config.icon) {
      case 'check':
        return (
          <svg className="status-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M10 3L4.5 8.5L2 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className="status-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 4V6.5M6 8.5H6.005M10.5 6C10.5 8.48528 8.48528 10.5 6 10.5C3.51472 10.5 1.5 8.48528 1.5 6C1.5 3.51472 3.51472 1.5 6 1.5C8.48528 1.5 10.5 3.51472 10.5 6Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'dot':
      default:
        return <span className="status-dot"></span>;
    }
  };

  return (
    <span className={`status-badge status-badge--${status}`}>
      {renderIcon()}
      <span className="status-label">{displayLabel}</span>
    </span>
  );
}

export default StatusBadge;
