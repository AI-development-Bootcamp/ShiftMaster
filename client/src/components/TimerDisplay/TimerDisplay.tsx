import AnimatedDigit from '../AnimatedDigit/AnimatedDigit';
import './TimerDisplay.css';

interface TimerDisplayProps {
  totalSeconds: number;
}

function TimerDisplay({ totalSeconds }: TimerDisplayProps) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

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
