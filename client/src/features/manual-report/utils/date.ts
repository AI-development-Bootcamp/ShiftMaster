import { DateValue } from '../types/manualReport';
import {
  HEBREW_MONTHS_SHORT,
  HEBREW_DAY_NAMES_FULL,
} from '../constants/hebrewCalendar';

export const formatDateDisplay = (date: Date): string => {
  const dayOfWeek = date.getDay();
  const dayName = HEBREW_DAY_NAMES_FULL[dayOfWeek];
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${dayName} ${day}/${month}/${year}`;
};

export const formatDate = (date: DateValue): string => {
  return `${date.day.toString().padStart(2, '0')} ${HEBREW_MONTHS_SHORT[date.month]} ${date.year}`;
};

export const formatDateForCalendar = (date: DateValue): string => {
  return `${date.day.toString().padStart(2, '0')} ${HEBREW_MONTHS_SHORT[date.month]} ${date.year}`;
};

export const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (month: number, year: number): number => {
  return new Date(year, month, 1).getDay();
};

export const generateCalendarDays = (
  month: number,
  year: number
): (number | null)[] => {
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return days;
};

export const compareDates = (date1: DateValue, date2: DateValue): number => {
  const d1 = new Date(date1.year, date1.month, date1.day);
  const d2 = new Date(date2.year, date2.month, date2.day);
  return d1.getTime() - d2.getTime();
};

export const calculateDaysBetween = (
  start: DateValue,
  end: DateValue
): number => {
  const startDateObj = new Date(start.year, start.month, start.day);
  const endDateObj = new Date(end.year, end.month, end.day);
  const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};
