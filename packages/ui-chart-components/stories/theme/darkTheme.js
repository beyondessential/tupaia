/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { createMuiTheme } from '@material-ui/core/styles';

const DARKENED_BLUE = '#0296c5';

export const darkTheme = createMuiTheme({
  palette: { type: 'dark', primary: { main: DARKENED_BLUE }, contrastText: 'white' },
});
