/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';

export const AppStyleProviders = ({ children }: { children: ReactNode }) => (
  <StylesProvider injectFirst>
    <ThemeProvider theme={theme}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeProvider>
  </StylesProvider>
);
