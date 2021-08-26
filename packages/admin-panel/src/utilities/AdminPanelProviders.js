/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@material-ui/core/CssBaseline';
import { persistor, store } from '../store';
import { theme } from '../theme';

export const AdminPanelProviders = ({ children }) => (
  <Provider store={store}>
    <PersistGate persistor={persistor} loading={null}>
      <StylesProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </MuiThemeProvider>
      </StylesProvider>
    </PersistGate>
  </Provider>
);
