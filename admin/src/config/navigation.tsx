import React from 'react';
import type { NavItemConfig } from '../components/RightSidebarTaskbar';

// SVG Icons as React components
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const ClientsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const HoursIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const EmployeesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ReportsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export const navigationItems: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'לוח בקרה',
    path: '/',
    icon: React.createElement(DashboardIcon),
  },
  {
    id: 'clients',
    label: 'ניהול לקוחות/פרויקטים',
    path: '/clients',
    icon: React.createElement(ClientsIcon),
  },
  {
    id: 'hours',
    label: 'הגדרת דיווחי שעות',
    path: '/hours',
    icon: React.createElement(HoursIcon),
  },
  {
    id: 'employees',
    label: 'ניהול עובדים',
    path: '/employees',
    icon: React.createElement(EmployeesIcon),
  },
  {
    id: 'reports',
    label: 'דוחות',
    path: '/reports',
    icon: React.createElement(ReportsIcon),
  },
];
