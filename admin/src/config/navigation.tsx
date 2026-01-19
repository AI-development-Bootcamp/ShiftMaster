import React from 'react';
import type { NavItemConfig } from '../components/RightSidebarTaskbar';
import { EmployeesManageIcon, HoursIcon, UserBadgeIcon } from '../constants/icons';
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
  {
    id: 'employees',
    label: 'ניהול עובדים',
    path: '/employees',
    icon: React.createElement(EmployeesManageIcon),
  },
];
