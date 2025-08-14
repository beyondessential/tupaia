import React from 'react';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@material-ui/core/CssBaseline';
import { lightTheme, darkTheme } from './theme';

export const AppProviders = ({
  params,
  children,
}: {
  params?: { theme?: 'light' | 'dark' };
  children: React.ReactNode;
}) => {
  const theme = params?.theme === 'dark' ? darkTheme : lightTheme;

  return (
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </MuiThemeProvider>
    </StylesProvider>
  );
};
