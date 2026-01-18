import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DailyEntryCard, { DailyEntry } from '../../components/DailyEntryCard/DailyEntryCard';
import TimerDisplay from '../../components/TimerDisplay/TimerDisplay';
import ManualReportModal from '../../components/ManualReportModal/ManualReportModal';
import './HomePage.css';

// Mock data for testing
const mockEntries: DailyEntry[] = [
  {
    id: '1',
    date: '16/10/25',
    dayName: "יום ה'",
    status: 'complete',
    hours: 9,
    timeEntries: [
      {
        id: '1-1',
        projectName: 'פרויקט אלפא',
        startTime: '09:00',
        endTime: '14:00',
        hours: '05:00',
      },
      {
        id: '1-2',
        projectName: 'פרויקט בטא',
        startTime: '14:30',
        endTime: '18:30',
        hours: '04:00',
      },
    ],
  },
  {
    id: '2',
    date: '15/10/25',
    dayName: "יום ד'",
    status: 'partial',
    hours: 7,
    timeEntries: [
      {
        id: '2-1',
        projectName: 'פרויקט גאמא',
        startTime: '09:00',
        endTime: '16:00',
        hours: '07:00',
      },
    ],
  },
  {
    id: '3',
    date: '14/10/25',
    dayName: "יום ג'",
    status: 'missing',
    timeEntries: [],
  },
  {
    id: '4',
    date: '13/10/25',
    dayName: "יום ב'",
    status: 'complete',
    hours: 9,
    timeEntries: [
      {
        id: '4-1',
        projectName: 'פרויקט דלתא',
        startTime: '08:30',
        endTime: '17:30',
        hours: '09:00',
      },
    ],
  },
  {
    id: '5',
    date: '12/10/25',
    dayName: "יום א'",
    status: 'sick',
    timeEntries: [],
  },
  {
    id: '6',
    date: '11/10/25',
    dayName: 'שבת',
    status: 'weekend',
    timeEntries: [],
  },
  {
    id: '7',
    date: '10/10/25',
    dayName: "יום ו'",
    status: 'weekend',
    timeEntries: [],
  },
  {
    id: '8',
    date: '09/10/25',
    dayName: "יום ה'",
    status: 'complete',
    hours: 8,
    timeEntries: [
      {
        id: '8-1',
        projectName: 'פרויקט אלפא',
        startTime: '09:00',
        endTime: '13:00',
        hours: '04:00',
      },
      {
        id: '8-2',
        projectName: 'פרויקט בטא',
        startTime: '14:00',
        endTime: '18:00',
        hours: '04:00',
      },
    ],
  },
];

const HEBREW_MONTHS = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
];

function HomePage() {
  const navigate = useNavigate();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // October
  const [prevMonthIndex, setPrevMonthIndex] = useState(9);
  const [monthDirection, setMonthDirection] = useState<'left' | 'right' | null>(null);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isManualReportModalOpen, setIsManualReportModalOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning]);

  useEffect(() => {
    if (monthDirection) {
      const timer = setTimeout(() => {
        setMonthDirection(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [monthDirection]);

  const handlePrevMonth = () => {
    setPrevMonthIndex(currentMonthIndex);
    setMonthDirection('right');
    setCurrentMonthIndex((prev) => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setPrevMonthIndex(currentMonthIndex);
    setMonthDirection('left');
    setCurrentMonthIndex((prev) => (prev === 11 ? 0 : prev + 1));
  };

  const handleToggleEntry = (id: string) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };

  const handleEditEntry = (entryId: string) => {
    // TODO: Navigate to edit entry page
    console.log('Edit entry:', entryId);
  };

  const handleAddReport = (dayId: string) => {
    // TODO: Navigate to add report page
    console.log('Add report for day:', dayId);
  };

  const handleToggleTimer = () => {
    if (isTimerRunning) {
      // Stop the timer and reset
      setIsTimerRunning(false);
      setElapsedSeconds(0);
    } else {
      // Start the timer
      setIsTimerRunning(true);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="header-left">
          <button className="logout-btn" onClick={handleLogout} aria-label="התנתק">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M13 14L17 10M17 10L13 6M17 10H7M7 3H5C3.89543 3 3 3.89543 3 5V15C3 16.1046 3.89543 17 5 17H7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="home-title">דיווח שעות</h1>
        </div>
        <div className="month-nav">
          <button className="month-nav-btn" onClick={handleNextMonth}>
            <span className="chevron-left">‹</span>
          </button>
          <div className="month-label-container">
            <span
              className={`month-label month-label-old ${
                monthDirection === 'left'
                  ? 'month-slide-out-left'
                  : monthDirection === 'right'
                  ? 'month-slide-out-right'
                  : 'month-hidden'
              }`}
            >
              {HEBREW_MONTHS[prevMonthIndex]}
            </span>
            <span
              className={`month-label ${
                monthDirection === 'left'
                  ? 'month-slide-in-left'
                  : monthDirection === 'right'
                  ? 'month-slide-in-right'
                  : ''
              }`}
            >
              {HEBREW_MONTHS[currentMonthIndex]}
            </span>
          </div>
          <button className="month-nav-btn" onClick={handlePrevMonth}>
            <span className="chevron-right">›</span>
          </button>
        </div>
      </header>

      {/* Main content - entries list */}
      <main className="home-content">
        <div className="entries-list">
          {mockEntries.map((entry) => (
            <DailyEntryCard
              key={entry.id}
              entry={entry}
              isExpanded={expandedEntryId === entry.id}
              onToggle={handleToggleEntry}
              onEditEntry={handleEditEntry}
              onAddReport={handleAddReport}
            />
          ))}
        </div>
      </main>

      {/* Bottom navigation - RTL: DOM order is reversed visually */}
      <nav className="bottom-nav">
        <div className="bottom-nav-content">
          <button className="nav-btn add-btn" onClick={() => setIsManualReportModalOpen(true)}>
            <span className="nav-label">דיווח ידני</span>
            <span className="nav-icon-wrapper">
              <span className="icon-outer-ring"></span>
              <span className="icon-inner-circle">
                {/* White circle with orange plus cutout */}
                <svg className="add-icon" width="21" height="21" viewBox="0 0 21 21" fill="none">
                  <circle cx="10.5" cy="10.5" r="10.5" fill="white"/>
                  <path d="M10.5 5C9.948 5 9.5 5.448 9.5 6V9.5H6C5.448 9.5 5 9.948 5 10.5C5 11.052 5.448 11.5 6 11.5H9.5V15C9.5 15.552 9.948 16 10.5 16C11.052 16 11.5 15.552 11.5 15V11.5H15C15.552 11.5 16 11.052 16 10.5C16 9.948 15.552 9.5 15 9.5H11.5V6C11.5 5.448 11.052 5 10.5 5Z" fill="url(#addGradient)"/>
                  <defs>
                    <linearGradient id="addGradient" x1="5" y1="5" x2="16" y2="16" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF9F00"/>
                      <stop offset="1" stopColor="#FF6B00"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </span>
          </button>
          <span className="nav-divider"></span>
          <button className="nav-btn clock-btn" onClick={handleToggleTimer}>
            <span className="nav-icon-wrapper">
              <span className="icon-outer-ring"></span>
              <span className="icon-inner-circle">
                {isTimerRunning ? (
                  <svg className="stop-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect width="12" height="12" rx="2" fill="white"/>
                  </svg>
                ) : (
                  <svg className="play-icon" width="14" height="16" viewBox="0 0 14 16" fill="none">
                    <path d="M13.8906 8.846C13.5371 10.189 11.8667 11.138 8.5257 13.0361C5.296 14.8709 3.6812 15.7884 2.3798 15.4196C1.8418 15.2671 1.3516 14.9776 0.9562 14.5787C0 13.6139 0 11.7426 0 8C0 4.2574 0 2.3861 0.9562 1.4213C1.3516 1.0225 1.8418 0.7329 2.3798 0.5804C3.6812 0.2117 5.296 1.1291 8.5257 2.9639C11.8667 4.862 13.5371 5.811 13.8906 7.154C14.0365 7.7084 14.0365 8.2916 13.8906 8.846Z" fill="white"/>
                  </svg>
                )}
              </span>
            </span>
            {isTimerRunning ? (
              <TimerDisplay totalSeconds={elapsedSeconds} />
            ) : (
              <span className="nav-label">הפעלת שעון</span>
            )}
          </button>
        </div>
      </nav>

      {/* Manual Report Modal */}
      <ManualReportModal
        isOpen={isManualReportModalOpen}
        onClose={() => setIsManualReportModalOpen(false)}
      />
    </div>
  );
}

export default HomePage;
