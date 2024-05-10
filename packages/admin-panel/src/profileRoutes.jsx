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
    path: '/profile',
    childViews: [
      {
        title: 'Profile',
        path: '',
        icon: <AccountCircleIcon />,
        Component: ProfilePage,
      },
      {
        title: 'Change Password',
        path: '/change-password',
        icon: <LockIcon />,
        Component: ChangePasswordPage,
      },
    ],
  },
];
