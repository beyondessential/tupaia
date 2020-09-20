import { ChangePasswordView, ProfileView } from './authentication';

export const PROFILE_ROUTES = [
  {
    to: '/profile',
    tabs: [
      {
        label: 'Profile',
        to: '',
        component: ProfileView,
      },
      {
        label: 'Change Password',
        to: '/change-password',
        component: ChangePasswordView,
      },
    ],
  },
];
