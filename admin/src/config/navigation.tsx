import React from 'react';
import type { NavItemConfig } from '../components/RightSidebarTaskbar';
import { EmployeesManageIcon, HoursIcon, UserBadgeIcon } from '../constants/icons';
import i18n from '../i18n/i18n';

export const navigationItems: NavItemConfig[] = [
  {
    id: 'assignment',
    label: i18n.t('navigation.assignment'),
    path: '/assignment',
    icon: React.createElement(UserBadgeIcon),
  },
  {
    id: 'entries',
    label: i18n.t('navigation.entries'),
    path: '/entries',
    icon: React.createElement(HoursIcon),
  },
  {
    id: 'employees',
    label: i18n.t('navigation.employees'),
    path: '/employees',
    icon: React.createElement(EmployeesManageIcon),
  },
];
