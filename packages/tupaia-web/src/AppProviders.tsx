/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode } from 'react';
import {
  createMuiTheme,
  ThemeProvider as MuiThemeProvider,
  StylesProvider,
} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from 'styled-components';

const theme = createMuiTheme();

export const AppStyleProviders = ({ children }: { children: ReactNode }) => (
  <StylesProvider injectFirst>
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </MuiThemeProvider>
  </StylesProvider>
);
