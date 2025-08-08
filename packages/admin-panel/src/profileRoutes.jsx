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
        label: 'Profile',
        path: '',
        icon: <AccountCircleIcon />,
        Component: ProfilePage,
      },
      {
        label: 'Change Password',
        path: '/change-password',
        icon: <LockIcon />,
        Component: ChangePasswordPage,
      },
    ],
  },
];
