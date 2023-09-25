/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { createMuiTheme } from '@material-ui/core';

export const theme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#328DE5', // Main blue (as seen on primary buttons)
      dark: '#004167',
    },
    secondary: {
      main: '#EC642D', // Tupaia orange
    },
    background: {
      default: '#F9F9F9', // Off white background
      paper: '#ffffff', // White background
    },
    text: {
      primary: '#2E2F33', // dark text color
      secondary: '#898989', // light grey text color
    },
    success: {
      main: '#25D366',
    },
    divider: '#DFDFDF',
    grey: {
      400: '#B8B8B8',
    },
    action: {
      hover: '#2a78c3',
    },
  },
  overrides: {
    MuiDialogActions: {
      root: {
        padding: '1.5rem 0 0 0',
      },
    },
    MuiButton: {
      root: {
        textTransform: 'none',
      },
      label: {
        fontSize: '0.875rem',
      },
    },
    MuiTypography: {
      h1: {
        fontSize: '1.125rem', // page titles
        fontWeight: 500,
      },
      h2: {
        fontSize: '1.125rem', // survey page titles
        fontWeight: 600,
      },
    },

    MuiMenuItem: {
      root: {
        fontSize: '0.875rem',
      },
    },
  },
});
