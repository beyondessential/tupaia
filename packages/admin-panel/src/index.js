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
import { withRouter } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import 'react-table/react-table.css';
import { theme } from './theme';
import { history, store, persistor } from './store';
import { AppContainer } from './App';

const RoutingApp = withRouter(AppContainer);

renderReactApp(
  <Provider store={store}>
    <PersistGate persistor={persistor} loading={null}>
      <StylesProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ConnectedRouter history={history}>
              <RoutingApp />
            </ConnectedRouter>
          </ThemeProvider>
        </MuiThemeProvider>
      </StylesProvider>
    </PersistGate>
  </Provider>,
  document.getElementById('root'),
);
