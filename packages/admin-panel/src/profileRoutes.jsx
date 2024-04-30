/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import LockIcon from '@material-ui/icons/Lock';
import { ProfilePage } from './pages/ProfilePage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';

export const PROFILE_ROUTES = [
  {
    url: '/profile',
    childViews: [
      {
        label: 'Profile',
        url: '',
        icon: <AccountCircleIcon />,
        Component: ProfilePage,
      },
      {
        label: 'Change Password',
        url: '/change-password',
        icon: <LockIcon />,
        Component: ChangePasswordPage,
      },
    ],
  },
];
