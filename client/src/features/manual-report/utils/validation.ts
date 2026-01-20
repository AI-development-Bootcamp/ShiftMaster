import { TimeValue } from '../types/manualReport';
import { timeToMinutes } from './time';
export type ProjectTimeValidationError =
  | {
      code: 'END_TIME_NOT_AFTER_START';
      message: string;
    }
  | {
      code: 'INVALID_TIME_VALUE';
      message: string;
    };



export const validateProjectTime = (
  startTime: TimeValue,
  endTime: TimeValue
): ProjectTimeValidationError | null => {
  try {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      return {
        code: 'END_TIME_NOT_AFTER_START',
        message: 'שעת הסיום חייבת להיות אחרי שעת ההתחלה',
      };
    }

    return null;
  } catch (error) {
    if (
      error instanceof Error &&
      (error as { code?: string }).code === 'INVALID_TIME_VALUE'
    ) {
      return {
        code: 'INVALID_TIME_VALUE',
        message: error.message,
      };
    }
    throw error;
  }
};
