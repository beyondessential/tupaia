/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode } from 'react';
import {
  StylesProvider,
  createMuiTheme,
  ThemeProvider as MuiThemeProvider,
} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from 'styled-components';

// Base theme overrides. Any extra overrides should be added here, as needed.
const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#0296c5', // Main blue (as seen on primary buttons)
    },
    secondary: {
      main: '##ee6230', // Tupaia Orange
    },
    background: {
      default: '#262834', // Dark blue background
    },
  },
});

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
