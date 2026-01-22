import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DailyEntryCard, {
  DailyEntry,
} from '../../components/DailyEntryCard/DailyEntryCard';
import TimerDisplay from '../../components/TimerDisplay/TimerDisplay';
import ManualReportModal from '../../components/ManualReportModal/ManualReportModal';
import LogoutButton from '../../components/LogoutButton/LogoutButton';
import { useTimer } from '../../hooks/useTimer';
import WelcomeIllustration from '../../assets/images/welcome-illustration.svg';
import '../../styles/HomePage.css';

// Function to load entries for a specific month/year
// TODO: Replace with actual API call to backend
const loadEntriesForMonth = (_month: number, _year: number): DailyEntry[] => {
  return [];
};

// Helper function to check if a month/year is in the future
const isFutureMonth = (month: number, year: number): boolean => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  if (year > currentYear) return true;
  if (year === currentYear && month > currentMonth) return true;
  return false;
};

function HomePage() {
  const { t } = useTranslation();

  // Timer state from Redux via useTimer hook
  const {
    isRunning: isTimerRunning,
    elapsedSeconds,
    loading: _timerLoading, // TODO: Use for loading state on button
    handleClockIn,
  } = useTimer();

  // TODO: Add TaskSelectionModal component to show on clock-out
  const [_isTaskSelectionOpen, setIsTaskSelectionOpen] = useState(false);

  const [currentMonthIndex, setCurrentMonthIndex] = useState(10); // November
  const [currentYear, setCurrentYear] = useState(2025);
  const [prevMonthIndex, setPrevMonthIndex] = useState(10);
  const [prevYear, setPrevYear] = useState(2025);
  const [monthDirection, setMonthDirection] = useState<'left' | 'right' | null>(
    null
  );
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [isManualReportModalOpen, setIsManualReportModalOpen] = useState(false);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  // Helper function to get month name from translation
  const getMonthName = (monthIndex: number): string => {
    const monthKeys = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ];
    return t(`monthNames.${monthKeys[monthIndex]}`);
  };

  // Load entries when month/year changes
  useEffect(() => {
    setIsLoadingEntries(true);
    // Simulate loading delay (remove when connecting to API)
    const timeoutId = setTimeout(() => {
      const loadedEntries = loadEntriesForMonth(currentMonthIndex, currentYear);
      setEntries(loadedEntries);
      setIsLoadingEntries(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentMonthIndex, currentYear]);

  // Timer interval is now handled by useTimer hook

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
    setPrevYear(currentYear);
    setMonthDirection('right');

    let newMonth = currentMonthIndex - 1;
    let newYear = currentYear;

    if (currentMonthIndex === 0) {
      newMonth = 11;
      newYear = currentYear - 1;
    }

    setCurrentMonthIndex(newMonth);
    setCurrentYear(newYear);
  };

  const handleNextMonth = () => {
    setPrevMonthIndex(currentMonthIndex);
    setPrevYear(currentYear);
    setMonthDirection('left');

    let newMonth = currentMonthIndex + 1;
    let newYear = currentYear;

    if (currentMonthIndex === 11) {
      newMonth = 0;
      newYear = currentYear + 1;
    }

    setCurrentMonthIndex(newMonth);
    setCurrentYear(newYear);
  };

  const handleToggleEntry = (id: string) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };

  const handleToggleTimer = () => {
    if (isTimerRunning) {
      // Open task selection modal for clock-out
      setIsTaskSelectionOpen(true);
    } else {
      // Clock in via Redux
      handleClockIn();
    }
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="header-left">
          <LogoutButton />
          <h1 className="home-title">{t('home.title')}</h1>
        </div>
        <div className="month-nav">
          <button
            type="button"
            className="month-nav-btn"
            onClick={handleNextMonth}
            aria-label={t('home.navigation.nextMonth')}
          >
            <span className="chevron-left">‹</span>
          </button>
          <div className="month-label-container">
            <span
              className={`month-label month-label-old ${monthDirection === 'left'
                ? 'month-slide-out-left'
                : monthDirection === 'right'
                  ? 'month-slide-out-right'
                  : 'month-hidden'
                }`}
            >
              {getMonthName(prevMonthIndex)} {prevYear}
            </span>
            <span
              className={`month-label ${monthDirection === 'left'
                ? 'month-slide-in-left'
                : monthDirection === 'right'
                  ? 'month-slide-in-right'
                  : ''
                }`}
            >
              {getMonthName(currentMonthIndex)} {currentYear}
            </span>
          </div>
          <button
            type="button"
            className="month-nav-btn"
            onClick={handlePrevMonth}
            aria-label={t('home.navigation.previousMonth')}
          >
            <span className="chevron-right">›</span>
          </button>
        </div>
      </header>

      {/* Main content - entries list */}
      <main className="home-content">
        <div className="entries-list">
          {isLoadingEntries ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p className="loading-text">{t('home.loadingReports')}</p>
            </div>
          ) : entries.length > 0 ? (
            entries.map((entry) => (
              <DailyEntryCard
                key={entry.id}
                entry={entry}
                isExpanded={expandedEntryId === entry.id}
                onToggle={handleToggleEntry}
              />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-circle">
                <img
                  src={WelcomeIllustration}
                  alt="No reports"
                  className="empty-state-illustration"
                />
                <div className="empty-state-content">
                  {isFutureMonth(currentMonthIndex, currentYear) ? (
                    <>
                      <p className="empty-state-title">
                        {t('home.emptyState.futureMonth.title')}
                      </p>
                      <p className="empty-state-subtitle">
                        {t('home.emptyState.futureMonth.subtitle')}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="empty-state-title">
                        {t('home.emptyState.noReports.title')}
                      </p>
                      <p className="empty-state-subtitle">
                        {t('home.emptyState.noReports.subtitleLine1')}
                        <br />
                        {t('home.emptyState.noReports.subtitleLine2')}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom navigation - RTL: DOM order is reversed visually */}
      <nav className="bottom-nav">
        <div className="bottom-nav-content">
          <button
            className="nav-btn add-btn"
            onClick={() => setIsManualReportModalOpen(true)}
          >
            <span className="nav-label">{t('home.actions.manualReport')}</span>
            <span className="nav-icon-wrapper">
              <span className="icon-outer-ring"></span>
              <span className="icon-inner-circle">
                {/* White circle with orange plus cutout */}
                <svg
                  className="add-icon"
                  width="21"
                  height="21"
                  viewBox="0 0 21 21"
                  fill="none"
                >
                  <circle cx="10.5" cy="10.5" r="10.5" fill="white" />
                  <path
                    d="M10.5 5C9.948 5 9.5 5.448 9.5 6V9.5H6C5.448 9.5 5 9.948 5 10.5C5 11.052 5.448 11.5 6 11.5H9.5V15C9.5 15.552 9.948 16 10.5 16C11.052 16 11.5 15.552 11.5 15V11.5H15C15.552 11.5 16 11.052 16 10.5C16 9.948 15.552 9.5 15 9.5H11.5V6C11.5 5.448 11.052 5 10.5 5Z"
                    fill="url(#addGradient)"
                  />
                  <defs>
                    <linearGradient
                      id="addGradient"
                      x1="5"
                      y1="5"
                      x2="16"
                      y2="16"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#FF9F00" />
                      <stop offset="1" stopColor="#FF6B00" />
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
                  <svg
                    className="stop-icon"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <rect width="12" height="12" rx="2" fill="white" />
                  </svg>
                ) : (
                  <svg
                    className="play-icon"
                    width="14"
                    height="16"
                    viewBox="0 0 14 16"
                    fill="none"
                  >
                    <path
                      d="M13.8906 8.846C13.5371 10.189 11.8667 11.138 8.5257 13.0361C5.296 14.8709 3.6812 15.7884 2.3798 15.4196C1.8418 15.2671 1.3516 14.9776 0.9562 14.5787C0 13.6139 0 11.7426 0 8C0 4.2574 0 2.3861 0.9562 1.4213C1.3516 1.0225 1.8418 0.7329 2.3798 0.5804C3.6812 0.2117 5.296 1.1291 8.5257 2.9639C11.8667 4.862 13.5371 5.811 13.8906 7.154C14.0365 7.7084 14.0365 8.2916 13.8906 8.846Z"
                      fill="white"
                    />
                  </svg>
                )}
              </span>
            </span>
            {isTimerRunning ? (
              <TimerDisplay totalSeconds={elapsedSeconds} />
            ) : (
              <span className="nav-label">{t('home.actions.startTimer')}</span>
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
