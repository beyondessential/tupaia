import { createMuiTheme } from '@material-ui/core';

export const theme = createMuiTheme(
  {
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
      text: {
        secondary: '#9ba0a6',
      },
    },
  },
  {
    projectCard: {
      background: '#2e2f33',
      fallBack: '#EFEFF0',
    },
    shape: {
      borderRadius: 3,
    },
    mobile: {
      background: '#313236', // Dark grey used on mobile
    },
    overlaySelector: {
      menuBackground: '#203e5c', // Dark blue used for button and header background in mobile overlay selector, as well as the background of the menu list on desktop
    },
  },
);
