import { createMuiTheme } from '@material-ui/core';

export const theme = createMuiTheme(
  {
    palette: {
      type: 'dark',
      primary: {
        main: '#0296c5', // Main blue (as seen on primary buttons)
      },
      secondary: {
        main: '#ee6230', // Tupaia Orange
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
    mapOverlaySelector: {
      width: 340,
      background: 'rgb(7, 40, 73)',
      datePicker: '#0F2847',
      library: {
        expanded: '#EFEFF0',
        collapsed: 'rgba(255, 255, 255, 0.6)',
      },
      divider: '#203e5c',
    },
  },
);
