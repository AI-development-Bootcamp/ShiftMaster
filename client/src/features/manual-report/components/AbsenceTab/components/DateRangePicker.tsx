import { useState } from 'react';
import { DateValue } from '../../../types/manualReport';
import {
  formatDate,
  formatDateForCalendar,
  generateCalendarDays,
  compareDates,
} from '../../../utils/date';
import { HEBREW_MONTHS_FULL, HEBREW_DAY_NAMES_FULL } from '../../../constants/hebrewCalendar';

interface DateRangePickerProps {
  startDate: DateValue;
  endDate: DateValue;
  onStartDateChange: (date: DateValue) => void;
  onEndDateChange: (date: DateValue) => void;
}

function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const [openCalendar, setOpenCalendar] = useState<'start' | 'end' | null>(
    null
  );
  const [calendarMonth, setCalendarMonth] = useState(9);
  const [calendarYear, setCalendarYear] = useState(2025);

  const handleToggleCalendar = (type: 'start' | 'end') => {
    if (openCalendar === type) {
      setOpenCalendar(null);
    } else {
      const currentDate = type === 'start' ? startDate : endDate;
      setOpenCalendar(type);
      setCalendarMonth(currentDate.month);
      setCalendarYear(currentDate.year);
    }
  };

  const handleCalendarPrevMonth = () => {
    const newMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
    const newYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  const handleCalendarNextMonth = () => {
    const newMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
    const newYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  const handleDateSelect = (day: number) => {
    if (!openCalendar) return;

    const selectedDate = { day, month: calendarMonth, year: calendarYear };

    if (openCalendar === 'start') {
      onStartDateChange(selectedDate);
      if (compareDates(selectedDate, endDate) > 0) {
        onEndDateChange(selectedDate);
      }
    } else {
      onEndDateChange(selectedDate);
      if (compareDates(selectedDate, startDate) < 0) {
        onStartDateChange(selectedDate);
      }
    }
  };

  const isDateSelected = (day: number): boolean => {
    if (!openCalendar) return false;
    const compareDate = openCalendar === 'start' ? startDate : endDate;
    return (
      compareDate.day === day &&
      compareDate.month === calendarMonth &&
      compareDate.year === calendarYear
    );
  };

  return (
    <>
      <div className="date-row" onClick={() => handleToggleCalendar('start')}>
        <span className="date-value">{formatDate(startDate)}</span>
        <span className="date-label">תאריך התחלה</span>
      </div>

      {openCalendar === 'start' && (
        <div className="calendar-dropdown">
          <div className="calendar-dropdown-header">
            <span className="calendar-header-date">
              {formatDateForCalendar(startDate)}
            </span>
            <span className="calendar-header-title">תאריך התחלה</span>
          </div>
          <div className="calendar-nav">
            <button
              className="calendar-nav-arrow"
              onClick={handleCalendarNextMonth}
              aria-label="חודש הבא"
            >
              ‹
            </button>
            <span className="calendar-month-display">
              {HEBREW_MONTHS_FULL[calendarMonth]} {calendarYear}
            </span>
            <button
              className="calendar-nav-arrow"
              onClick={handleCalendarPrevMonth}
              aria-label="חודש קודם"
            >
              ›
            </button>
          </div>
          <div className="calendar-weekdays">
            {HEBREW_DAY_NAMES_FULL.map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>
          <div className="calendar-grid">
            {generateCalendarDays(calendarMonth, calendarYear).map(
              (day, index) => (
                <div
                  key={index}
                  className={`calendar-grid-day ${
                    day === null ? 'calendar-grid-day-empty' : ''
                  } ${
                    day !== null && isDateSelected(day)
                      ? 'calendar-grid-day-selected'
                      : ''
                  }`}
                  onClick={() => day !== null && handleDateSelect(day)}
                >
                  {day}
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className="date-row" onClick={() => handleToggleCalendar('end')}>
        <span className="date-value">{formatDate(endDate)}</span>
        <span className="date-label">תאריך סיום</span>
      </div>

      {openCalendar === 'end' && (
        <div className="calendar-dropdown">
          <div className="calendar-dropdown-header">
            <span className="calendar-header-date">
              {formatDateForCalendar(endDate)}
            </span>
            <span className="calendar-header-title">תאריך סיום</span>
          </div>
          <div className="calendar-nav">
            <button
              className="calendar-nav-arrow"
              onClick={handleCalendarNextMonth}
              aria-label="חודש הבא"
            >
              ‹
            </button>
            <span className="calendar-month-display">
              {HEBREW_MONTHS_FULL[calendarMonth]} {calendarYear}
            </span>
            <button
              className="calendar-nav-arrow"
              onClick={handleCalendarPrevMonth}
              aria-label="חודש קודם"
            >
              ›
            </button>
          </div>
          <div className="calendar-weekdays">
            {HEBREW_DAY_NAMES_FULL.map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>
          <div className="calendar-grid">
            {generateCalendarDays(calendarMonth, calendarYear).map(
              (day, index) => (
                <div
                  key={index}
                  className={`calendar-grid-day ${
                    day === null ? 'calendar-grid-day-empty' : ''
                  } ${
                    day !== null && isDateSelected(day)
                      ? 'calendar-grid-day-selected'
                      : ''
                  }`}
                  onClick={() => day !== null && handleDateSelect(day)}
                >
                  {day}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default DateRangePicker;
