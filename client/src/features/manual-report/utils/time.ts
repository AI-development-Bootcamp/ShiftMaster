import { TimeValue } from '../types/manualReport';

export const timeToMinutes = (time: TimeValue): number => {
  const validHours = Number.isInteger(time.hours) && time.hours >= 1 && time.hours <= 12;
  const validMinutes =
    Number.isInteger(time.minutes) && time.minutes >= 0 && time.minutes <= 59;
  if (!validHours || !validMinutes) {
    const error = Object.assign(new Error('Invalid time value'), {
      code: 'INVALID_TIME_VALUE',
    });
    throw error;
  }
  let hours24 = time.hours;
  if (time.period === 'PM' && hours24 !== 12) hours24 += 12;
  if (time.period === 'AM' && hours24 === 12) hours24 = 0;
  return hours24 * 60 + time.minutes;
};

export const formatTime = (hours: number, minutes: number): string => {
  const validHours = Number.isInteger(hours) && hours >= 0 && hours <= 23;
  const validMinutes = Number.isInteger(minutes) && minutes >= 0 && minutes <= 59;
  if (!validHours || !validMinutes) {
    const error = Object.assign(new Error('Invalid time value'), {
      code: 'INVALID_TIME_VALUE',
    });
    throw error;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
