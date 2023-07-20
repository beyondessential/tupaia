/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { createMuiTheme } from '@material-ui/core';

const DARKENED_BLUE = '#262834';

export const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#1978D4', // Main blue (as seen on primary buttons)
    },
    secondary: {
      main: '#ee6230',
    },
    background: {
      default: '#262834', // Dark blue background
      paper: '#262834', // Dark blue to match background
    },
    text: {
      secondary: '#9ba0a6',
    },
  },
});
