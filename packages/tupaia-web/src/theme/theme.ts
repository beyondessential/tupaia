import { createMuiTheme } from '@material-ui/core';

export const theme = createMuiTheme(
  {
    palette: {
      type: 'dark',
      primary: {
        main: '#0296c5', // Main blue (as seen on primary buttons)
      },
      secondary: {
        main: '##ee6230', // Tupaia Orange
      },
      background: {
        default: '#262834', // Dark blue background
      },
    },
  },
  {
    topBarHeight: {
      default: 60,
      mobile: 50,
    },
  },
);
