import { useState, useRef, useEffect } from 'react';
import './ManualReportModal.css';

interface ManualReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ManualReportModal({ isOpen, onClose }: ManualReportModalProps) {
  const [activeTab, setActiveTab] = useState<'work' | 'absence'>('work');
  const [editingField, setEditingField] = useState<'entry' | 'exit' | null>(null);
  const [entryTime, setEntryTime] = useState({ hours: 9, minutes: 41, period: 'AM' as 'AM' | 'PM' });
  const [exitTime, setExitTime] = useState({ hours: 9, minutes: 4, period: 'AM' as 'AM' | 'PM' });

  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  // Generate hours (1-12), minutes (0-59), and periods (AM/PM)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods: ('AM' | 'PM')[] = ['AM', 'PM'];

  // Scroll to selected values when picker opens
  useEffect(() => {
    if (editingField) {
      const currentTime = editingField === 'entry' ? entryTime : exitTime;

      if (hoursRef.current) {
        const hourIndex = hours.indexOf(currentTime.hours);
        hoursRef.current.scrollTop = hourIndex * 40;
      }
      if (minutesRef.current) {
        minutesRef.current.scrollTop = currentTime.minutes * 40;
      }
      if (periodRef.current) {
        const periodIndex = periods.indexOf(currentTime.period);
        periodRef.current.scrollTop = periodIndex * 40;
      }
    }
  }, [editingField]);

  // Handle scroll to update selected time
  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    items: any[],
    field: 'hours' | 'minutes' | 'period'
  ) => {
    if (!ref.current) return;

    const scrollTop = ref.current.scrollTop;
    const itemHeight = 40;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

    const currentTime = editingField === 'entry' ? entryTime : exitTime;
    const setTime = editingField === 'entry' ? setEntryTime : setExitTime;

    if (field === 'hours' && currentTime.hours !== items[clampedIndex]) {
      setTime({ ...currentTime, hours: items[clampedIndex] });
    } else if (field === 'minutes' && currentTime.minutes !== items[clampedIndex]) {
      setTime({ ...currentTime, minutes: items[clampedIndex] });
    } else if (field === 'period' && currentTime.period !== items[clampedIndex]) {
      setTime({ ...currentTime, period: items[clampedIndex] });
    }
  };

  // Handle wheel event to control scroll amount
  const handleWheel = (
    e: React.WheelEvent<HTMLDivElement>,
    ref: React.RefObject<HTMLDivElement>,
    items: any[]
  ) => {
    e.preventDefault();
    if (!ref.current) return;

    const itemHeight = 40;
    const currentScroll = ref.current.scrollTop;
    const currentIndex = Math.round(currentScroll / itemHeight);

    // Determine direction: positive deltaY = scroll down, negative = scroll up
    const direction = e.deltaY > 0 ? 1 : -1;
    const newIndex = Math.max(0, Math.min(currentIndex + direction, items.length - 1));

    ref.current.scrollTop = newIndex * itemHeight;
  };

  // Handle clicking on an item to jump to it
  const handleItemClick = (
    ref: React.RefObject<HTMLDivElement>,
    itemIndex: number
  ) => {
    if (!ref.current) return;

    const itemHeight = 40;
    const targetScroll = itemIndex * itemHeight;

    ref.current.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  const handleTimeClick = (field: 'entry' | 'exit') => {
    setEditingField(editingField === field ? null : field);
  };

  const formatTime = (hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose} aria-label="סגור">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h2 className="modal-title">דיווח ידני</h2>
        </div>

        <div className="modal-body">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'work' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('work')}
            >
              דיווח עבודה
            </button>
            <button
              className={`tab ${activeTab === 'absence' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('absence')}
            >
              דיווח היעדרות
            </button>
          </div>

          <div className="info-row">
            <div className="date-display">יום ב' 06/10/25</div>
            <div className="daily-quota">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#22C55E" strokeWidth="2" fill="none" />
                <path d="M7 4V7.5M7 10H7.01" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>תקן יומי 9 שעות</span>
            </div>
          </div>

          <div className="time-entries">
            <div className="time-entry-row" onClick={() => handleTimeClick('entry')}>
              <span className="time-value">{formatTime(entryTime.hours, entryTime.minutes)}</span>
              <span className="time-label">כניסה</span>
            </div>

            {editingField === 'entry' && (
              <div className="time-picker">
                <div className="time-picker-columns" dir="ltr">
                  <div
                    className="time-picker-column"
                    ref={hoursRef}
                    onScroll={() => handleScroll(hoursRef, hours, 'hours')}
                    onWheel={(e) => handleWheel(e, hoursRef, hours)}
                  >
                    <div className="time-picker-padding"></div>
                    {hours.map((hour, index) => (
                      <div
                        key={hour}
                        className={`time-picker-item ${entryTime.hours === hour ? 'time-picker-item-selected' : ''}`}
                        onClick={() => handleItemClick(hoursRef, index)}
                      >
                        {hour}
                      </div>
                    ))}
                    <div className="time-picker-padding"></div>
                  </div>
                  <div
                    className="time-picker-column"
                    ref={minutesRef}
                    onScroll={() => handleScroll(minutesRef, minutes, 'minutes')}
                    onWheel={(e) => handleWheel(e, minutesRef, minutes)}
                  >
                    <div className="time-picker-padding"></div>
                    {minutes.map((minute, index) => (
                      <div
                        key={minute}
                        className={`time-picker-item ${entryTime.minutes === minute ? 'time-picker-item-selected' : ''}`}
                        onClick={() => handleItemClick(minutesRef, index)}
                      >
                        {minute.toString().padStart(2, '0')}
                      </div>
                    ))}
                    <div className="time-picker-padding"></div>
                  </div>
                  <div
                    className="time-picker-column"
                    ref={periodRef}
                    onScroll={() => handleScroll(periodRef, periods, 'period')}
                    onWheel={(e) => handleWheel(e, periodRef, periods)}
                  >
                    <div className="time-picker-padding"></div>
                    {periods.map((period, index) => (
                      <div
                        key={period}
                        className={`time-picker-item ${entryTime.period === period ? 'time-picker-item-selected' : ''}`}
                        onClick={() => handleItemClick(periodRef, index)}
                      >
                        {period}
                      </div>
                    ))}
                    <div className="time-picker-padding"></div>
                  </div>
                </div>
                <div className="time-picker-selection-indicator"></div>
              </div>
            )}

            <div className="time-entry-row" onClick={() => handleTimeClick('exit')}>
              <span className="time-value">{formatTime(exitTime.hours, exitTime.minutes)}</span>
              <span className="time-label">יציאה</span>
            </div>

            {editingField === 'exit' && (
              <div className="time-picker">
                <div className="time-picker-columns" dir="ltr">
                  <div
                    className="time-picker-column"
                    ref={hoursRef}
                    onScroll={() => handleScroll(hoursRef, hours, 'hours')}
                    onWheel={(e) => handleWheel(e, hoursRef, hours)}
                  >
                    <div className="time-picker-padding"></div>
                    {hours.map((hour, index) => (
                      <div
                        key={hour}
                        className={`time-picker-item ${exitTime.hours === hour ? 'time-picker-item-selected' : ''}`}
                        onClick={() => handleItemClick(hoursRef, index)}
                      >
                        {hour}
                      </div>
                    ))}
                    <div className="time-picker-padding"></div>
                  </div>
                  <div
                    className="time-picker-column"
                    ref={minutesRef}
                    onScroll={() => handleScroll(minutesRef, minutes, 'minutes')}
                    onWheel={(e) => handleWheel(e, minutesRef, minutes)}
                  >
                    <div className="time-picker-padding"></div>
                    {minutes.map((minute, index) => (
                      <div
                        key={minute}
                        className={`time-picker-item ${exitTime.minutes === minute ? 'time-picker-item-selected' : ''}`}
                        onClick={() => handleItemClick(minutesRef, index)}
                      >
                        {minute.toString().padStart(2, '0')}
                      </div>
                    ))}
                    <div className="time-picker-padding"></div>
                  </div>
                  <div
                    className="time-picker-column"
                    ref={periodRef}
                    onScroll={() => handleScroll(periodRef, periods, 'period')}
                    onWheel={(e) => handleWheel(e, periodRef, periods)}
                  >
                    <div className="time-picker-padding"></div>
                    {periods.map((period, index) => (
                      <div
                        key={period}
                        className={`time-picker-item ${exitTime.period === period ? 'time-picker-item-selected' : ''}`}
                        onClick={() => handleItemClick(periodRef, index)}
                      >
                        {period}
                      </div>
                    ))}
                    <div className="time-picker-padding"></div>
                  </div>
                </div>
                <div className="time-picker-selection-indicator"></div>
              </div>
            )}
          </div>

          <button className="add-project-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M10 6V14M6 10H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>הוספת פרויקט</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManualReportModal;
