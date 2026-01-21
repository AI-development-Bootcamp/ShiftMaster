import AnimatedDigit from '../AnimatedDigit/AnimatedDigit';
import '../../styles/TimerDisplay.css';

interface TimerDisplayProps {
  totalSeconds: number;
}

function TimerDisplay({ totalSeconds }: TimerDisplayProps) {
  // Validate and sanitize totalSeconds
  const sanitized = Number.isFinite(+totalSeconds)
    ? Math.floor(+totalSeconds)
    : NaN;
  let sanitizedSeconds = 0;

  if (Number.isNaN(sanitized) || typeof totalSeconds !== 'number') {
    console.error(
      '[TD_INVALID_INPUT] TimerDisplay received invalid totalSeconds:',
      totalSeconds
    );
    sanitizedSeconds = 0;
  } else if (sanitized < 0) {
    sanitizedSeconds = 0;
  } else if (sanitized > 359999) {
    sanitizedSeconds = 359999; // Cap at 99:59:59
  } else {
    sanitizedSeconds = sanitized;
  }

  const hours = Math.floor(sanitizedSeconds / 3600);
  const minutes = Math.floor((sanitizedSeconds % 3600) / 60);
  const seconds = sanitizedSeconds % 60;

  const hour1 = Math.floor(hours / 10);
  const hour2 = hours % 10;
  const minute1 = Math.floor(minutes / 10);
  const minute2 = minutes % 10;
  const second1 = Math.floor(seconds / 10);
  const second2 = seconds % 10;

  return (
    <div className="timer-display-container">
      <AnimatedDigit value={hour1} />
      <AnimatedDigit value={hour2} />
      <span className="timer-colon">:</span>
      <AnimatedDigit value={minute1} />
      <AnimatedDigit value={minute2} />
      <span className="timer-colon">:</span>
      <AnimatedDigit value={second1} />
      <AnimatedDigit value={second2} />
    </div>
  );
}

export default TimerDisplay;
