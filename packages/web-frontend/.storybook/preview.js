/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { addDecorator } from '@storybook/react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { DARKENED_BLUE } from '../src/styles';
import { MuiThemeProvider as V0MuiThemeProvider } from 'material-ui';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

addDecorator(storyFn => (
  <MuiThemeProvider
    theme={createMuiTheme({ palette: { type: 'dark', primary: { main: DARKENED_BLUE } } })}
  >
    <V0MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>{storyFn()}</V0MuiThemeProvider>
  </MuiThemeProvider>
));
