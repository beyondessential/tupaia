/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { render as renderReactApp } from 'react-dom';

import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import 'react-table/react-table.css';

import { theme } from './theme';
import { store, persistor } from './store';
import { App } from './App';

renderReactApp(
  <Provider store={store}>
    <PersistGate persistor={persistor} loading={null}>
      <StylesProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </MuiThemeProvider>
      </StylesProvider>
    </PersistGate>
  </Provider>,
  document.getElementById('root'),
);
