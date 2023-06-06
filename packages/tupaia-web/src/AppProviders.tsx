/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { ReactNode } from 'react';
import {
  StylesProvider,
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from 'styled-components';

const muiTheme = createTheme({
  palette: {
    type: 'dark',
  },
});

const theme = {
  ...muiTheme,
  boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.3)',
  colors: {
    black: {
      high: 'rgba(43, 45, 56, 0.97)',
      mid: 'rgba(43, 45, 56, 0.94)',
      low: 'rgba(43, 45, 56, 0.8)',
    },
    blue: {
      darkest: '#262834',
      dark: '#2e3040',
      mid: '#22c7fc',
      primary: '#2196f3',
      light: '#cde9ff',
    },
  },
};

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
