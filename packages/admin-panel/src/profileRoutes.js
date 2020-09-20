/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { ProfilePage } from './pages/ProfilePage';

export const PROFILE_ROUTES = [
  {
    to: '/profile',
    tabs: [
      {
        label: 'Profile',
        to: '',
        component: ProfilePage,
      },
      {
        label: 'Change Password',
        to: '/change-password',
        component: ChangePasswordPage,
      },
    ],
  },
];
