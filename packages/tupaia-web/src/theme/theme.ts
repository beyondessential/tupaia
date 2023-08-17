import { createMuiTheme } from '@material-ui/core';
import { TRANSPARENT_BLACK } from '../constants';

export const theme = createMuiTheme(
  {
    typography: {
      fontSize: 16, // this needs to be 16 to correctly calculate the axis labels in recharts
      body1: {
        fontSize: '1rem',
      },
    },
    // these overrides are needed to make up for the base font-size being 16px
    overrides: {
      MuiPaper: {
        root: {
          fontSize: '0.875rem',
        },
      },
      MuiCardHeader: {
        root: {
          fontSize: '0.875rem',
        },
      },
      MuiCheckbox: {
        root: {
          fontSize: '1.5rem',
        },
      },
      MuiSvgIcon: {
        root: {
          fontSize: '1.5rem',
        },
      },
    },
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
        paper: '#262834', // Dark blue to match background
      },
      text: {
        secondary: '#9ba0a6',
      },
    },
  },
  {
    panel: {
      background: TRANSPARENT_BLACK,
      secondaryBackground: '#4a4b55',
    },
    form: {
      border: '#d9d9d9',
    },
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
    searchBar: {
      background: '#202124',
    },
    overlaySelector: {
      overlayNameBackground: '#072849',
      menuBackground: '#203e5c', // Dark blue used for button and header background in mobile overlay selector, as well as the background of the menu list on desktop
    },
    dashboardItem: {
      multiValue: {
        data: '#22c7fc',
      },
    },
  },
);
