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
    primary: { main: DARKENED_BLUE },
    contrastText: 'white',
    background: {
      default: DARKENED_BLUE,
    },
  },
});
