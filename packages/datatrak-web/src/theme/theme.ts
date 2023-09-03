/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { createMuiTheme } from '@material-ui/core';

export const theme = createMuiTheme(
  {
    palette: {
      type: 'light',
      primary: {
        main: '#328DE5', // Main purple (as seen on primary buttons)
      },
      secondary: {
        main: '#328de533', // Light purple
      },
      background: {
        default: '#F9F9F9', // Off white background
        paper: '#ffffff', // White background
      },
      text: {
        primary: '#333333', // dark text color
        secondary: '#B8B8B8', // light grey text color
      },
      divider: '#DFDFDF',
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
          fontSize: '1rem',
        },
      },
      MuiTypography: {
        h1: {
          fontSize: '1.125rem', // page titles
          fontWeight: 500,
        },
        h2: {
          fontSize: '1.125rem', // survey page titles
        },
      },
    },
  },
  {
    progressBar: {
      main: '#004167',
    },
  },
);
