import { TimeValue } from '../types/manualReport';
import { timeToMinutes } from './time';

export const validateProjectTime = (
  startTime: TimeValue,
  endTime: TimeValue
): string | null => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (endMinutes <= startMinutes) {
    return 'שעת הסיום חייבת להיות אחרי שעת ההתחלה';
  }

  return null;
};
