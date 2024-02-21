import { createMuiTheme } from '@material-ui/core';

export const theme = createMuiTheme({
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
    MuiCssBaseline: {
      '@global': {
        fieldset: {
          border: 0,
          margin: 0,
          minWidth: 0,
          padding: 0,
        },
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
      default: '#2e2f33', // Light black
      paper: '#202124', // Dark Black
    },
    text: {
      secondary: '#9ba0a6',
    },
    success: {
      main: '#25d366',
    },
    form: {
      border: '#d9d9d9',
    },
    overlaySelector: {
      overlayNameBackground: '#072849',
      menuBackground: '#203e5c', // Dark blue used for button and header background in mobile overlay selector, as well as the background of the menu list on desktop
      mobile: '#313236', // Dark grey used on mobile overlay selector
    },
    dashboardItem: {
      multiValue: {
        data: '#22c7fc',
      },
    },
  },
});
