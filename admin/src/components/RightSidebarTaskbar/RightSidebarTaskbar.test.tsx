import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import { RightSidebarTaskbar } from './RightSidebarTaskbar';
import type { NavItemConfig, UserProfile } from './RightSidebarTaskbar';

const mockNavItems: NavItemConfig[] = [
  { id: 'dashboard', label: 'לוח בקרה', path: '/' },
  { id: 'clients', label: 'ניהול לקוחות', path: '/clients' },
  { id: 'reports', label: 'דוחות', path: '/reports' },
];

const mockUser: UserProfile = {
  name: 'דניאל מולא',
  role: 'ראש צוות פיתוח',
};

const renderWithRouter = (ui: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <MemoryRouter
      initialEntries={initialEntries}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {ui}
    </MemoryRouter>
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

    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.role)).toBeInTheDocument();
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
