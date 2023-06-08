import { createMuiTheme } from '@material-ui/core';

export const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#1978D4', // Main blue (as seen on primary buttons)
    },
    secondary: {
      main: '#ee6230', // Tupaia Orange
    },
    background: {
      default: '#262834', // Dark blue background
    },
  },
  shape: {
    borderRadius: 3,
  },
});
