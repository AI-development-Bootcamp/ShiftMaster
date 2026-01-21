import { AbsenceType } from '../types/manualReport';

export const ABSENCE_TYPES: AbsenceType[] = [
  { id: 'vacation-half', label: 'חופשה - חצי יום', emoji: '🏖️' },
  { id: 'vacation-full', label: 'חופשה - יום מלא', emoji: '🏖️' },
  { id: 'sick', label: 'מחלה', emoji: '😷' },
  { id: 'reserves', label: 'מילואים', emoji: '🚨' },
];
