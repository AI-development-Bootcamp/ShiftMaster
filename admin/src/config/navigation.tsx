import React from 'react';
import type { NavItemConfig } from '../components/RightSidebarTaskbar';

// SVG Icons as React components
const HoursIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const UserBadgeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
    <circle cx="12" cy="10" r="3" />
    <path d="M16 17a4 4 0 0 0-8 0" />
  </svg>
);

export const navigationItems: NavItemConfig[] = [
  {
    id: 'assignment',
    label: 'ניהול לקוחות/פרויקטים',
    path: '/assignment',
    icon: React.createElement(UserBadgeIcon),
  },
  {
    id: 'entries',
    label: 'הגדרת דיווחי שעות',
    path: '/entries',
    icon: React.createElement(HoursIcon),
  },
];
