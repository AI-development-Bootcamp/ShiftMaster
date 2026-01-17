import { useState } from 'react';
import './HomePage.css';

/**
 * Render the application's Home page with month navigation, main content placeholder, and bottom action buttons.
 *
 * @returns The HomePage component's JSX element containing a header with the current month and navigation buttons, a main content area for daily entries, and a bottom navigation with clock and manual-report actions.
 */
function HomePage() {
  const [currentMonth, setCurrentMonth] = useState('אוקטובר');

  const handlePrevMonth = () => {
    // TODO: Implement month navigation
    console.log('Previous month');
  };

  const handleNextMonth = () => {
    // TODO: Implement month navigation
    console.log('Next month');
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <h1 className="home-title">דיווח שעות</h1>
        <div className="month-nav">
          <button className="month-nav-btn" onClick={handleNextMonth}>
            <span className="chevron-left">‹</span>
          </button>
          <span className="month-label">{currentMonth}</span>
          <button className="month-nav-btn" onClick={handlePrevMonth}>
            <span className="chevron-right">›</span>
          </button>
        </div>
      </header>

      {/* Main content - entries list will go here */}
      <main className="home-content">
        {/* Daily entries list - Step 2 */}
      </main>

      {/* Bottom navigation */}
      <nav className="bottom-nav">
        <button className="nav-btn clock-btn">
          <span className="nav-icon clock-icon">▶</span>
          <span className="nav-label">הפעלת שעון</span>
        </button>
        <button className="nav-btn add-btn">
          <span className="nav-label">דיווח ידני</span>
          <span className="nav-icon add-icon">+</span>
        </button>
      </nav>
    </div>
  );
}

export default HomePage;