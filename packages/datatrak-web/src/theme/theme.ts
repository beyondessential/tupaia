import { createMuiTheme } from '@material-ui/core';

export const theme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#4A79EA', // Main purple (as seen on primary buttons)
    },
    secondary: {
      main: '#E7EFFF', // Light purple
    },
    background: {
      default: '#F9F9F9', // Off white background
      paper: '#ffffff', // White background
    },
    text: {
      primary: '#333333', // dark text color
      secondary: '#B8B8B8', // light grey text color
    },
  },
  overrides: {
    MuiButton: {
      root: {
        textTransform: 'none',
      },
    },
  },
});
