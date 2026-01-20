import { TimeValue } from '../types/manualReport';
import { timeToMinutes } from './time';
export type ProjectTimeValidationError = {
  code: 'END_TIME_NOT_AFTER_START';
  message: string;
};



export const validateProjectTime = (
  startTime: TimeValue,
  endTime: TimeValue
): ProjectTimeValidationError | null => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (endMinutes <= startMinutes) {
    return {
      code: 'END_TIME_NOT_AFTER_START',
      message: 'שעת הסיום חייבת להיות אחרי שעת ההתחלה',
    };
  }

  return null;
};
