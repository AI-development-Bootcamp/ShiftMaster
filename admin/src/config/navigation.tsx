import React from 'react';
import type { NavItemConfig } from '../components/RightSidebarTaskbar';
import { EmployeesManageIcon, HoursIcon, UserBadgeIcon } from '../constants/icons';
import { TFunction } from 'i18next';

export const getNavigationItems = (t: TFunction): NavItemConfig[] => [
  {
    id: 'assignment',
    label: t('navigation.assignment'),
    path: '/assignment',
    icon: React.createElement(UserBadgeIcon),
  },
  {
    id: 'entries',
    label: t('navigation.entries'),
    path: '/entries',
    icon: React.createElement(HoursIcon),
  },
  {
    id: 'employees',
    label: t('navigation.employees'),
    path: '/employees',
    icon: React.createElement(EmployeesManageIcon),
  },
];
