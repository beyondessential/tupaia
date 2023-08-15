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
      secondary: '#4A79EA', // purple text for secondary buttons etc
    },
  },
});
