/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from 'styled-components';
// import { theme } from '@tupaia/ui-components';
import { theme } from './theme';
import App from './App';

ReactDOM.render(
  <StylesProvider injectFirst>
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </MuiThemeProvider>
  </StylesProvider>,
  document.getElementById('root'),
);
