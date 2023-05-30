/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ReactNode } from 'react';
import { StylesProvider } from '@material-ui/styles';
import { ThemeProvider } from 'styled-components';
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { MuiThemeProvider as V0MuiThemeProvider } from 'material-ui';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import { DARKENED_BLUE } from './theme';

const theme = createTheme({ palette: { type: 'dark', primary: { main: DARKENED_BLUE } } });

export const AppStyleProviders = ({ children }: { children: ReactNode }) => {
  return (
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <V0MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>{children}</V0MuiThemeProvider>
        </ThemeProvider>
      </MuiThemeProvider>
    </StylesProvider>
  );
};
