import { useState, useRef, useEffect } from 'react';
import './ManualReportModal.css';
import SelectionModal, { SelectionType, SelectionGroup } from '../SelectionModal/SelectionModal';

interface ManualReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TimeValue {
  hours: number;
  minutes: number;
  period: 'AM' | 'PM';
}

interface ProjectEntry {
  id: string;
  project: string;
  task: string;
  location: string;
  startTime: TimeValue;
  endTime: TimeValue;
  description: string;
}

interface AbsenceType {
  id: string;
  label: string;
  emoji: string;
}

interface DateValue {
  day: number;
  month: number;
  year: number;
}

type TimePickerItem = number | 'AM' | 'PM';

function ManualReportModal({ isOpen, onClose }: ManualReportModalProps) {
  const [activeTab, setActiveTab] = useState<'work' | 'absence'>('work');
  const [editingField, setEditingField] = useState<'entry' | 'exit' | string | null>(null);
  const [entryTime, setEntryTime] = useState<TimeValue>({ hours: 9, minutes: 41, period: 'AM' });
  const [exitTime, setExitTime] = useState<TimeValue>({ hours: 9, minutes: 4, period: 'AM' });
  const [projectEntries, setProjectEntries] = useState<ProjectEntry[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [timeErrors, setTimeErrors] = useState<Record<string, string>>({});
  const [showMissingHoursAlert, setShowMissingHoursAlert] = useState(false);
  const [selectionModal, setSelectionModal] = useState<{ isOpen: boolean; type: SelectionType | null; projectId: string | null }>({
    isOpen: false,
    type: null,
    projectId: null,
  });

  // Absence report state
  const [selectedAbsenceType, setSelectedAbsenceType] = useState<AbsenceType | null>(null);
  const [isAbsenceDropdownOpen, setIsAbsenceDropdownOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isMultiDayView, setIsMultiDayView] = useState(false);
  const [startDate, setStartDate] = useState<DateValue>({ day: 4, month: 9, year: 2025 });
  const [endDate, setEndDate] = useState<DateValue>({ day: 8, month: 9, year: 2025 });
  const [openCalendar, setOpenCalendar] = useState<'start' | 'end' | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(9);
  const [calendarYear, setCalendarYear] = useState(2025);

  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const absenceDropdownRef = useRef<HTMLDivElement>(null);

  // Absence types
  const absenceTypes: AbsenceType[] = [
    { id: 'vacation-half', label: 'חופשה - חצי יום', emoji: '🏖️' },
    { id: 'vacation-full', label: 'חופשה - יום מלא', emoji: '🏖️' },
    { id: 'sick', label: 'מחלה', emoji: '😷' },
    { id: 'reserves', label: 'מילואים', emoji: '🚨' },
  ];

  // Hebrew month names (abbreviated)
  const hebrewMonthsShort = [
    'ינו\'', 'פבר\'', 'מרץ', 'אפר\'', 'מאי', 'יוני',
    'יולי', 'אוג\'', 'ספט\'', 'אוק\'', 'נוב\'', 'דצמ\''
  ];

  // Hebrew month names (full)
  const hebrewMonthsFull = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  // Hebrew day names (full for calendar)
  const hebrewDayNamesFull = ['יום א\'', 'יום ב\'', 'יום ג\'', 'יום ד\'', 'יום ה\'', 'יום ו\'', 'שבת'];

  // Mock data for selections
  const projectGroups: SelectionGroup[] = [
    {
      title: 'אברה',
      items: ['פרויקט א', 'פרויקט ב', 'פרויקט ג']
    },
    {
      title: 'חברת הייטק',
      items: ['מערכת ניהול', 'אפליקציה מובייל', 'אתר אינטרנט']
    },
    {
      title: 'לקוח פרטי',
      items: ['יעוץ', 'פיתוח', 'תחזוקה']
    }
  ];

  const taskGroups: SelectionGroup[] = [
    {
      title: 'משימות',
      items: ['פיתוח', 'בדיקות', 'תיעוד', 'ישיבות', 'תכנון', 'Code Review']
    }
  ];

  const locationGroups: SelectionGroup[] = [
    {
      title: 'מיקום',
      items: ['משרד', 'עבודה מהבית', 'אצל לקוח', 'בחוץ']
    }
  ];

  // Generate hours (1-12), minutes (0-59), and periods (AM/PM)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods: ('AM' | 'PM')[] = ['AM', 'PM'];

  // Convert time to minutes since midnight for comparison
  const timeToMinutes = (time: TimeValue): number => {
    let hours24 = time.hours;
    if (time.period === 'PM' && hours24 !== 12) hours24 += 12;
    if (time.period === 'AM' && hours24 === 12) hours24 = 0;
    return hours24 * 60 + time.minutes;
  };

  // Calculate days between two dates (inclusive)
  const calculateDaysBetween = (start: DateValue, end: DateValue): number => {
    const startDateObj = new Date(start.year, start.month, start.day);
    const endDateObj = new Date(end.year, end.month, end.day);
    const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // +1 to include both start and end days
  };

  // Format date for display
  const formatDate = (date: DateValue): string => {
    return `${date.day.toString().padStart(2, '0')} ${hebrewMonthsShort[date.month]} ${date.year}`;
  };

  // Format date for calendar header (e.g. "04 נוב 2025")
  const formatDateForCalendar = (date: DateValue): string => {
    return `${date.day.toString().padStart(2, '0')} ${hebrewMonthsShort[date.month]} ${date.year}`;
  };

  // Get days in month
  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days array
  const generateCalendarDays = (month: number, year: number): (number | null)[] => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // Toggle calendar dropdown
  const handleToggleCalendar = (type: 'start' | 'end') => {
    if (openCalendar === type) {
      // Close if already open
      setOpenCalendar(null);
    } else {
      // Open and set to current date's month/year
      const currentDate = type === 'start' ? startDate : endDate;
      setOpenCalendar(type);
      setCalendarMonth(currentDate.month);
      setCalendarYear(currentDate.year);
    }
  };

  // Handle calendar month navigation
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

  // Compare two dates (returns negative if date1 < date2, 0 if equal, positive if date1 > date2)
  const compareDates = (date1: DateValue, date2: DateValue): number => {
    const d1 = new Date(date1.year, date1.month, date1.day);
    const d2 = new Date(date2.year, date2.month, date2.day);
    return d1.getTime() - d2.getTime();
  };

  // Handle date selection from calendar
  const handleDateSelect = (day: number) => {
    if (!openCalendar) return;

    const selectedDate = { day, month: calendarMonth, year: calendarYear };

    if (openCalendar === 'start') {
      setStartDate(selectedDate);
      // If start date is after end date, update end date to match start date
      if (compareDates(selectedDate, endDate) > 0) {
        setEndDate(selectedDate);
      }
    } else {
      setEndDate(selectedDate);
      // If end date is before start date, update start date to match end date
      if (compareDates(selectedDate, startDate) < 0) {
        setStartDate(selectedDate);
      }
    }
  };

  // Check if date is selected in calendar
  const isDateSelected = (day: number): boolean => {
    if (!openCalendar) return false;
    const compareDate = openCalendar === 'start' ? startDate : endDate;
    return (
      compareDate.day === day &&
      compareDate.month === calendarMonth &&
      compareDate.year === calendarYear
    );
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('הקובץ גדול מדי. גודל מקסימלי: 10MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('סוג קובץ לא נתמך. אנא העלה JPG, PNG או PDF');
      return;
    }

    setUploadedFile(file);
  };


  // Validate project times
  const validateProjectTime = (projectId: string, startTime: TimeValue, endTime: TimeValue) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    const newErrors = { ...timeErrors };

    if (endMinutes <= startMinutes) {
      newErrors[projectId] = 'שעת הסיום חייבת להיות אחרי שעת ההתחלה';
    } else {
      delete newErrors[projectId];
    }

    setTimeErrors(newErrors);
  };

  // Calculate total hours from all project entries
  const calculateTotalHours = (): number => {
    let totalMinutes = 0;
    projectEntries.forEach(project => {
      const startMinutes = timeToMinutes(project.startTime);
      const endMinutes = timeToMinutes(project.endTime);
      if (endMinutes > startMinutes) {
        totalMinutes += (endMinutes - startMinutes);
      }
    });
    return Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal
  };

  // Handle save button
  const handleSave = () => {
    if (activeTab === 'work') {
      // Work tab validation
      if (Object.keys(timeErrors).length > 0) {
        // There are errors, don't close
        return;
      }

      // Check if total hours is less than 9
      const totalHours = calculateTotalHours();
      if (totalHours < 9) {
        setShowMissingHoursAlert(true);
        return;
      }

      // TODO: Save the work data to backend/state
      console.log('Saving work data:', {
        entryTime,
        exitTime,
        projectEntries
      });
    } else {
      // Absence tab
      // TODO: Save the absence data to backend/state
      console.log('Saving absence data:', {
        selectedAbsenceType,
        uploadedFile,
        isMultiDayView,
        startDate,
        endDate
      });
    }

    // Close modal
    onClose();
  };

  // Handle completing hours
  const handleCompleteHours = () => {
    setShowMissingHoursAlert(false);
    // User will add more hours manually
  };

  // Handle don't show again
  const handleDontShowAgain = () => {
    setShowMissingHoursAlert(false);
    // TODO: Save the data anyway
    console.log('Saving data:', {
      entryTime,
      exitTime,
      projectEntries
    });
    onClose();
  };

  // Add new project entry
  const handleAddProject = () => {
    const newProject: ProjectEntry = {
      id: Date.now().toString(),
      project: '',
      task: '',
      location: '',
      startTime: { hours: 9, minutes: 0, period: 'AM' },
      endTime: { hours: 5, minutes: 0, period: 'PM' },
      description: '',
    };
    setProjectEntries([...projectEntries, newProject]);
  };

  // Update project description
  const handleDescriptionChange = (projectId: string, description: string) => {
    setProjectEntries(projectEntries.map(p =>
      p.id === projectId ? { ...p, description } : p
    ));
  };

  // Delete project with confirmation
  const handleDeleteProject = (projectId: string) => {
    setDeleteConfirmId(projectId);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setProjectEntries(projectEntries.filter(p => p.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  // Handle opening selection modal
  const handleOpenSelection = (type: SelectionType, projectId: string) => {
    setSelectionModal({ isOpen: true, type, projectId });
  };

  // Handle closing selection modal
  const handleCloseSelection = () => {
    setSelectionModal({ isOpen: false, type: null, projectId: null });
  };

  // Handle selection from modal
  const handleSelection = (value: string) => {
    if (!selectionModal.projectId || !selectionModal.type) return;

    const fieldType = selectionModal.type;
    const projectId = selectionModal.projectId;

    setProjectEntries(projectEntries.map(p => {
      if (p.id === projectId) {
        return { ...p, [fieldType]: value };
      }
      return p;
    }));
  };

  // Get current selection groups based on type
  const getSelectionGroups = (): SelectionGroup[] => {
    switch (selectionModal.type) {
      case 'project':
        return projectGroups;
      case 'task':
        return taskGroups;
      case 'location':
        return locationGroups;
      default:
        return [];
    }
  };

  // Get current time value being edited
  const getCurrentTime = (): TimeValue => {
    if (editingField === 'entry') return entryTime;
    if (editingField === 'exit') return exitTime;
    if (typeof editingField === 'string' && editingField.startsWith('project-')) {
      const [, projectId, field] = editingField.split('-');
      const project = projectEntries.find(p => p.id === projectId);
      if (project) {
        return field === 'start' ? project.startTime : project.endTime;
      }
    }
    return entryTime;
  };

  // Set current time value being edited
  const setCurrentTime = (newTime: TimeValue) => {
    if (editingField === 'entry') {
      setEntryTime(newTime);
    } else if (editingField === 'exit') {
      setExitTime(newTime);
    } else if (typeof editingField === 'string' && editingField.startsWith('project-')) {
      const [, projectId, field] = editingField.split('-');
      setProjectEntries(projectEntries.map(p => {
        if (p.id === projectId) {
          const updatedProject = {
            ...p,
            [field === 'start' ? 'startTime' : 'endTime']: newTime
          };
          // Validate after update
          setTimeout(() => {
            validateProjectTime(projectId, updatedProject.startTime, updatedProject.endTime);
          }, 0);
          return updatedProject;
        }
        return p;
      }));
    }
  };

  // Scroll to selected values when picker opens
  useEffect(() => {
    if (editingField) {
      const currentTime = getCurrentTime();

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
    items: TimePickerItem[],
    field: 'hours' | 'minutes' | 'period'
  ) => {
    if (!ref.current) return;

    const scrollTop = ref.current.scrollTop;
    const itemHeight = 40;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

    const currentTime = getCurrentTime();

    if (field === 'hours' && currentTime.hours !== items[clampedIndex]) {
      setCurrentTime({ ...currentTime, hours: items[clampedIndex] as number });
    } else if (field === 'minutes' && currentTime.minutes !== items[clampedIndex]) {
      setCurrentTime({ ...currentTime, minutes: items[clampedIndex] as number });
    } else if (field === 'period' && currentTime.period !== items[clampedIndex]) {
      setCurrentTime({ ...currentTime, period: items[clampedIndex] as 'AM' | 'PM' });
    }
  };

  // Handle wheel event to control scroll amount
  const handleWheel = (
    e: React.WheelEvent<HTMLDivElement>,
    ref: React.RefObject<HTMLDivElement>,
    items: TimePickerItem[]
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

  const handleTimeClick = (field: 'entry' | 'exit' | string) => {
    setEditingField(editingField === field ? null : field);
  };

  const formatTime = (hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        absenceDropdownRef.current &&
        !absenceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAbsenceDropdownOpen(false);
      }
    };

    if (isAbsenceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAbsenceDropdownOpen]);

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

          {/* Work Report Tab */}
          {activeTab === 'work' && (
            <>
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
              <span className="time-label">כניסה</span>
              <span className="time-value">{formatTime(entryTime.hours, entryTime.minutes)}</span>
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
              <span className="time-label">יציאה</span>
              <span className="time-value">{formatTime(exitTime.hours, exitTime.minutes)}</span>
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

          {/* Project Entries Section */}
          {projectEntries.length > 0 && (
            <div className="project-entries-section">
              <h3 className="section-title">דיווח פרוייקטים</h3>
              {projectEntries.map((project) => (
                <div key={project.id} className="project-entry">
                  {/* Project selection fields */}
                  <div className="project-field" onClick={() => handleOpenSelection('project', project.id)}>
                    <span className={`field-label ${!project.project ? 'placeholder' : ''}`}>
                      {project.project || 'בחר פרויקט'}
                    </span>
                    <span className="field-chevron">›</span>
                  </div>

                  <div className="project-field" onClick={() => handleOpenSelection('task', project.id)}>
                    <span className={`field-label ${!project.task ? 'placeholder' : ''}`}>
                      {project.task || 'בחר משימה'}
                    </span>
                    <span className="field-chevron">›</span>
                  </div>

                  <div className="project-field" onClick={() => handleOpenSelection('location', project.id)}>
                    <span className={`field-label ${!project.location ? 'placeholder' : ''}`}>
                      {project.location || 'בחר מיקום'}
                    </span>
                    <span className="field-icon">◊</span>
                  </div>

                  {/* Project time entries */}
                  <div className="project-time-row" onClick={() => handleTimeClick(`project-${project.id}-start`)}>
                    <span className="time-label">שעת התחלה</span>
                    <span className="time-value">{formatTime(project.startTime.hours, project.startTime.minutes)}</span>
                  </div>

                  {editingField === `project-${project.id}-start` && (
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
                              className={`time-picker-item ${project.startTime.hours === hour ? 'time-picker-item-selected' : ''}`}
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
                              className={`time-picker-item ${project.startTime.minutes === minute ? 'time-picker-item-selected' : ''}`}
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
                              className={`time-picker-item ${project.startTime.period === period ? 'time-picker-item-selected' : ''}`}
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

                  <div className="project-time-row" onClick={() => handleTimeClick(`project-${project.id}-end`)}>
                    <span className="time-label">שעת סיום</span>
                    <span className="time-value">{formatTime(project.endTime.hours, project.endTime.minutes)}</span>
                  </div>

                  {editingField === `project-${project.id}-end` && (
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
                              className={`time-picker-item ${project.endTime.hours === hour ? 'time-picker-item-selected' : ''}`}
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
                              className={`time-picker-item ${project.endTime.minutes === minute ? 'time-picker-item-selected' : ''}`}
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
                              className={`time-picker-item ${project.endTime.period === period ? 'time-picker-item-selected' : ''}`}
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

                  {/* Description field */}
                  <textarea
                    className="project-description"
                    placeholder="הוספת פירוט..."
                    value={project.description}
                    onChange={(e) => handleDescriptionChange(project.id, e.target.value)}
                    rows={3}
                    dir="rtl"
                  />

                  {/* Delete button */}
                  <button className="delete-project-btn" onClick={() => handleDeleteProject(project.id)}>
                    מחיקת פרויקט
                  </button>

                  {/* Error message */}
                  {timeErrors[project.id] && (
                    <div className="project-time-error" role="alert">
                      {timeErrors[project.id]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Project Button */}
          <button className="add-project-btn" onClick={handleAddProject}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M10 6V14M6 10H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>הוספת פרויקט</span>
          </button>

          {/* Delete Confirmation Dialog */}
          {deleteConfirmId && (
            <div className="confirmation-overlay" onClick={cancelDelete}>
              <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="confirmation-icon-wrapper">
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                    <rect width="56" height="56" rx="8" fill="#FEF5CC" />
                    <path d="M28 18L38 36H18L28 18Z" fill="#945312" />
                    <path d="M28 26V30M28 32V33" stroke="#FEF5CC" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="confirmation-main-message">למחוק את הדיווח זה מהפרויקטים?</p>
                <p className="confirmation-sub-message">המחיקה היא קבועה ולא ניתן יהיה לשחזר את הדיווח.</p>
                <button className="confirmation-link-btn" onClick={cancelDelete}>מעדיף שלא למחוק</button>
                <button className="confirmation-primary-btn" onClick={confirmDelete}>מחק את הפרויקט</button>
              </div>
            </div>
          )}

          {/* Missing Hours Alert Dialog */}
          {showMissingHoursAlert && (
            <div className="confirmation-overlay" onClick={() => setShowMissingHoursAlert(false)}>
              <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="confirmation-icon-wrapper">
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                    <rect width="56" height="56" rx="8" fill="#FEF5CC" />
                    <path d="M28 18L38 36H18L28 18Z" fill="#945312" />
                    <path d="M28 26V30M28 32V33" stroke="#FEF5CC" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="confirmation-main-message">יום העבודה שלך טרם הושלם.</p>
                <p className="confirmation-sub-message">חסרות {Math.max(0, 9 - calculateTotalHours())} שעות דיווח כדי למלוא את היום.</p>
                <button className="confirmation-link-btn" onClick={handleDontShowAgain}>אל תציג לנו זאת</button>
                <button className="confirmation-primary-btn" onClick={handleCompleteHours}>תן לי להשלים את השעות</button>
              </div>
            </div>
          )}

          {/* Selection Modal */}
          <SelectionModal
            isOpen={selectionModal.isOpen}
            onClose={handleCloseSelection}
            type={selectionModal.type || 'project'}
            groups={getSelectionGroups()}
            onSelect={handleSelection}
          />
            </>
          )}

          {/* Absence Report Tab */}
          {activeTab === 'absence' && (
            <>
              <div className="info-row">
                <div className="date-display">יום ב' 06/10/25</div>
              </div>

              {/* Absence Type Selector */}
              <div className="absence-type-section" ref={absenceDropdownRef}>
                <div
                  className="absence-type-selector"
                  onClick={() => setIsAbsenceDropdownOpen(!isAbsenceDropdownOpen)}
                >
                  <span className="absence-type-chevron">◊</span>
                  <span className="absence-type-text">
                    {selectedAbsenceType ? (
                      <>
                        <span className="absence-emoji">{selectedAbsenceType.emoji}</span>
                        {selectedAbsenceType.label}
                      </>
                    ) : (
                      'בחר סוג היעדרות'
                    )}
                  </span>
                </div>

                {/* Absence Type Dropdown */}
                {isAbsenceDropdownOpen && (
                  <div className="absence-dropdown">
                    {absenceTypes.map((type) => (
                      <div
                        key={type.id}
                        className={`absence-dropdown-item ${
                          selectedAbsenceType?.id === type.id ? 'absence-dropdown-item-selected' : ''
                        }`}
                        onClick={() => {
                          setSelectedAbsenceType(type);
                          setIsAbsenceDropdownOpen(false);
                        }}
                      >
                        {selectedAbsenceType?.id === type.id && (
                          <svg className="check-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="10" fill="#3B82F6" />
                            <path
                              d="M6 10L9 13L14 7"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        <span className="absence-dropdown-text">
                          <span className="absence-emoji">{type.emoji}</span>
                          {type.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Multi-day or Single-day View */}
              {!isMultiDayView ? (
                <>
                  {/* File Upload Section */}
                  <div className="file-upload-section">
                    <h3 className="file-upload-title">צירוף קבצים ומסמכים</h3>
                    <div
                      className="file-upload-area"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadedFile ? (
                        <div className="file-uploaded">
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <rect width="40" height="40" rx="8" fill="#3B82F6" fillOpacity="0.1" />
                            <path
                              d="M20 12V20M20 20V28M20 20H28M20 20H12"
                              stroke="#3B82F6"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          <p className="file-name">{uploadedFile.name}</p>
                          <p className="file-size">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <>
                          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                            <rect x="12" y="16" width="40" height="32" rx="2" stroke="#3B82F6" strokeWidth="2" />
                            <circle cx="32" cy="28" r="4" fill="#3B82F6" />
                            <path
                              d="M12 40L20 32L28 40L40 28L52 40"
                              stroke="#3B82F6"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p className="file-upload-link">לחץ כאן להעלאת הקובץ</p>
                          <p className="file-upload-hint">סוג הקבצים הנתמכים : JPG / PNG / PDF</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {/* OR Divider */}
                  <div className="divider-section">
                    <span className="divider-line"></span>
                    <span className="divider-text">או</span>
                    <span className="divider-line"></span>
                  </div>

                  {/* Multi-day Button */}
                  <button
                    className="multi-day-btn"
                    onClick={() => setIsMultiDayView(true)}
                  >
                    <span className="multi-day-chevron">‹</span>
                    <span>לדווח על היעדרות יותר מיום אחד</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Multi-day View */}
                  <div className="multi-day-header">
                    <button
                      className="multi-day-back-btn"
                      onClick={() => setIsMultiDayView(false)}
                    >
                      <span className="back-chevron">›</span>
                    </button>
                    <h3 className="multi-day-title">דיווח היעדרות לפי טווח</h3>
                  </div>

                  <div className="form-section-title">מלא את הטופס</div>

                  {/* Start Date */}
                  <div className="date-row" onClick={() => handleToggleCalendar('start')}>
                    <span className="date-value">{formatDate(startDate)}</span>
                    <span className="date-label">תאריך התחלה</span>
                  </div>

                  {/* Start Date Calendar Dropdown */}
                  {openCalendar === 'start' && (
                    <div className="calendar-dropdown">
                      <div className="calendar-dropdown-header">
                        <span className="calendar-header-date">{formatDateForCalendar(startDate)}</span>
                        <span className="calendar-header-title">תאריך התחלה</span>
                      </div>
                      <div className="calendar-nav">
                        <button className="calendar-nav-arrow" onClick={handleCalendarNextMonth} aria-label="חודש הבא">
                          ‹
                        </button>
                        <span className="calendar-month-display">
                          {hebrewMonthsFull[calendarMonth]} {calendarYear}
                        </span>
                        <button className="calendar-nav-arrow" onClick={handleCalendarPrevMonth} aria-label="חודש קודם">
                          ›
                        </button>
                      </div>
                      <div className="calendar-weekdays">
                        {hebrewDayNamesFull.map((day) => (
                          <div key={day} className="calendar-weekday">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="calendar-grid">
                        {generateCalendarDays(calendarMonth, calendarYear).map((day, index) => (
                          <div
                            key={index}
                            className={`calendar-grid-day ${
                              day === null ? 'calendar-grid-day-empty' : ''
                            } ${
                              day !== null && isDateSelected(day) ? 'calendar-grid-day-selected' : ''
                            }`}
                            onClick={() => day !== null && handleDateSelect(day)}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* End Date */}
                  <div className="date-row" onClick={() => handleToggleCalendar('end')}>
                    <span className="date-value">{formatDate(endDate)}</span>
                    <span className="date-label">תאריך סיום</span>
                  </div>

                  {/* End Date Calendar Dropdown */}
                  {openCalendar === 'end' && (
                    <div className="calendar-dropdown">
                      <div className="calendar-dropdown-header">
                        <span className="calendar-header-date">{formatDateForCalendar(endDate)}</span>
                        <span className="calendar-header-title">תאריך סיום</span>
                      </div>
                      <div className="calendar-nav">
                        <button className="calendar-nav-arrow" onClick={handleCalendarNextMonth} aria-label="חודש הבא">
                          ‹
                        </button>
                        <span className="calendar-month-display">
                          {hebrewMonthsFull[calendarMonth]} {calendarYear}
                        </span>
                        <button className="calendar-nav-arrow" onClick={handleCalendarPrevMonth} aria-label="חודש קודם">
                          ›
                        </button>
                      </div>
                      <div className="calendar-weekdays">
                        {hebrewDayNamesFull.map((day) => (
                          <div key={day} className="calendar-weekday">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="calendar-grid">
                        {generateCalendarDays(calendarMonth, calendarYear).map((day, index) => (
                          <div
                            key={index}
                            className={`calendar-grid-day ${
                              day === null ? 'calendar-grid-day-empty' : ''
                            } ${
                              day !== null && isDateSelected(day) ? 'calendar-grid-day-selected' : ''
                            }`}
                            onClick={() => day !== null && handleDateSelect(day)}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Days Calculation */}
                  <div className="days-summary">
                    סך הכל ימי דיווח: <span className="days-number">{calculateDaysBetween(startDate, endDate)} ימים</span>
                  </div>

                  {/* File Upload Section (same as single-day) */}
                  <div className="file-upload-section">
                    <h3 className="file-upload-title">צירוף קבצים ומסמכים</h3>
                    <div
                      className="file-upload-area"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadedFile ? (
                        <div className="file-uploaded">
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <rect width="40" height="40" rx="8" fill="#3B82F6" fillOpacity="0.1" />
                            <path
                              d="M20 12V20M20 20V28M20 20H28M20 20H12"
                              stroke="#3B82F6"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          <p className="file-name">{uploadedFile.name}</p>
                          <p className="file-size">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <>
                          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                            <rect x="12" y="16" width="40" height="32" rx="2" stroke="#3B82F6" strokeWidth="2" />
                            <circle cx="32" cy="28" r="4" fill="#3B82F6" />
                            <path
                              d="M12 40L20 32L28 40L40 28L52 40"
                              stroke="#3B82F6"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p className="file-upload-link">לחץ כאן להעלאת הקובץ</p>
                          <p className="file-upload-hint">סוג הקבצים הנתמכים : JPG / PNG / PDF</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {activeTab === 'work' ? (
            <>
              <div className="footer-hours-summary">
                <div className="hours-reported">
                  <span className="hours-number">{calculateTotalHours()}</span>
                  <span className="hours-text"> מתוך 9 שעות</span>
                </div>
                <div className="hours-remaining">
                  חסרות {Math.max(0, 9 - calculateTotalHours())} שעות לדיווח
                </div>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.min((calculateTotalHours() / 9) * 100, 100)}%` }}
                />
              </div>
              <button className="footer-save-btn" onClick={handleSave}>
                שמירה
              </button>
            </>
          ) : (
            <button className="footer-save-btn" onClick={handleSave}>
              שמירה
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManualReportModal;
