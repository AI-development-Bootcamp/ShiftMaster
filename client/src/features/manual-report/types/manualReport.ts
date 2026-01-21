export interface TimeValue {
  hours: number;
  minutes: number;
  period: 'AM' | 'PM';
}

export interface ProjectEntry {
  id: string;
  project: string;
  task: string;
  location: string;
  startTime: TimeValue;
  endTime: TimeValue;
  description: string;
}

export interface AbsenceType {
  id: string;
  label: string;
  emoji: string;
}

export interface DateValue {
  day: number;
  month: number;
  year: number;
}

export interface FileUploadError {
  code: 'FILE_TOO_LARGE' | 'UNSUPPORTED_TYPE' | null;
  message?: string;
}

export interface HalfVacationError {
  code: 'HALF_VACATION_CAP' | null;
  message?: string;
}

export type TimePickerItem = number | 'AM' | 'PM';

export interface ManualReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDayAbsenceType?:
    | 'vacation-half'
    | 'vacation-full'
    | 'sick'
    | 'reserves'
    | null;
  selectedDate?: Date;
}

export interface TimePickerRefs {
  hours: React.RefObject<HTMLDivElement>;
  minutes: React.RefObject<HTMLDivElement>;
  period: React.RefObject<HTMLDivElement>;
}

export interface TimePickerProps {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
  isOpen: boolean;
}

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

export interface MissingHoursDialogProps {
  isOpen: boolean;
  missingHours: number;
  onComplete: () => void;
  onDontShowAgain: () => void;
}
