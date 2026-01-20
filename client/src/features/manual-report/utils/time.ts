import { TimeValue } from '../types/manualReport';

export const timeToMinutes = (time: TimeValue): number => {
  let hours24 = time.hours;
  if (time.period === 'PM' && hours24 !== 12) hours24 += 12;
  if (time.period === 'AM' && hours24 === 12) hours24 = 0;
  return hours24 * 60 + time.minutes;
};

export const formatTime = (hours: number, minutes: number): string => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
