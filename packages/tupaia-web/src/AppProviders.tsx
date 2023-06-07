/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode } from 'react';
import {
  StylesProvider, 
  ThemeProvider as MuiThemeProvider,
} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import { QueryClient, QueryClientProvider } from 'react-query';


const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <StylesProvider injectFirst>
    <ThemeProvider theme={theme}>
      <MuiThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          {children}
        </QueryClientProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  </StylesProvider>
);
