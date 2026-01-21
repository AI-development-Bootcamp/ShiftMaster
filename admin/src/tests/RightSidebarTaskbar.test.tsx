import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom/vitest';
import { User, UserRole } from '@abra-shift-master/shared';
import { RightSidebarTaskbar } from '../components/RightSidebarTaskbar/RightSidebarTaskbar';
import type { NavItemConfig } from '../components/RightSidebarTaskbar/RightSidebarTaskbar';
import authReducer from '../store/slices/authSlice';

const mockNavItems: NavItemConfig[] = [
  { id: 'dashboard', label: 'לוח בקרה', path: '/' },
  { id: 'clients', label: 'ניהול לקוחות', path: '/clients' },
  { id: 'reports', label: 'דוחות', path: '/reports' },
];

const mockUser: User = {
  user_id: 1,
  full_name: 'דניאל מולא',
  email: 'daniel@abra.com',
  role: UserRole.ADMIN,
  job_title: 'ראש צוות פיתוח',
  active: true,
  created_at: '2024-01-01T08:00:00Z',
};

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
    },
  });
};

const renderWithRouter = (ui: React.ReactElement, initialEntries = ['/']) => {
  const store = createMockStore();

  return render(
    <Provider store={store}>
      <MemoryRouter
        initialEntries={initialEntries}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {ui}
      </MemoryRouter>
    </Provider>
  );
};

describe('RightSidebarTaskbar', () => {
  it('should render the sidebar with navigation', () => {
    renderWithRouter(
      <RightSidebarTaskbar navItems={mockNavItems} user={mockUser} />
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should render the company logo', () => {
    renderWithRouter(
      <RightSidebarTaskbar navItems={mockNavItems} user={mockUser} />
    );

    expect(screen.getByAltText('לוגו Abra')).toBeInTheDocument();
  });

  it('should render all navigation items', () => {
    renderWithRouter(
      <RightSidebarTaskbar navItems={mockNavItems} user={mockUser} />
    );

    mockNavItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('should render user profile information', () => {
    renderWithRouter(
      <RightSidebarTaskbar navItems={mockNavItems} user={mockUser} />
    );

    expect(screen.getByText(mockUser.full_name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.job_title)).toBeInTheDocument();
  });

  it('should have proper ARIA labels', () => {
    renderWithRouter(
      <RightSidebarTaskbar navItems={mockNavItems} user={mockUser} />
    );

    expect(screen.getByLabelText('תפריט ראשי')).toBeInTheDocument();
    expect(screen.getByLabelText('ניווט ראשי')).toBeInTheDocument();
  });
});

describe('NavItem active state', () => {
  it('should mark the current route as active', () => {
    renderWithRouter(
      <RightSidebarTaskbar navItems={mockNavItems} user={mockUser} />,
      ['/']
    );

    const dashboardLink = screen.getByText('לוח בקרה').closest('a');
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    expect(dashboardLink).toHaveClass('nav-item--active');
  });

  it('should not mark non-current routes as active', () => {
    renderWithRouter(
      <RightSidebarTaskbar navItems={mockNavItems} user={mockUser} />,
      ['/']
    );

    const clientsLink = screen.getByText('ניהול לקוחות').closest('a');
    expect(clientsLink).not.toHaveAttribute('aria-current');
    expect(clientsLink).not.toHaveClass('nav-item--active');
  });

  it('should update active state when route changes', () => {
    renderWithRouter(
      <RightSidebarTaskbar navItems={mockNavItems} user={mockUser} />,
      ['/clients']
    );

    const clientsLink = screen.getByText('ניהול לקוחות').closest('a');
    expect(clientsLink).toHaveAttribute('aria-current', 'page');
    expect(clientsLink).toHaveClass('nav-item--active');

    const dashboardLink = screen.getByText('לוח בקרה').closest('a');
    expect(dashboardLink).not.toHaveAttribute('aria-current');
  });
});

describe('NavItem keyboard navigation', () => {
  it('should render navigation links as focusable elements', () => {
    renderWithRouter(
      <RightSidebarTaskbar navItems={mockNavItems} user={mockUser} />
    );

    mockNavItems.forEach((item) => {
      const link = screen.getByText(item.label).closest('a');
      expect(link).toHaveAttribute('href', item.path);
    });
  });
});
