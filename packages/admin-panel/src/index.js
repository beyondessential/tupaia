/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { render as renderReactApp } from 'react-dom';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import 'react-table/react-table.css';
import { EnvBanner } from '@tupaia/ui-components';
import AdminPanel from './App';
import { VizBuilderProviders } from './utilities/VizBuilderProviders';
import { AdminPanelProviders } from './utilities/AdminPanelProviders';
import { StoreProvider } from './utilities/StoreProvider';
import { Footer, Navbar } from './widgets';
import { TupaiaApi } from './api';
import { theme } from './theme';

const VizBuilder = lazy(() => import('./VizBuilderApp'));

const api = new TupaiaApi();

renderReactApp(
  <Router>
    <Suspense fallback={<div>loading...</div>}>
      {/* Store provider applied above routes so that it always persists auth state */}
      <StoreProvider api={api} persist>
        <EnvBanner />
        <StylesProvider injectFirst>
          <MuiThemeProvider theme={theme}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Switch>
                <Route path="/viz-builder">
                  <VizBuilderProviders>
                    <VizBuilder Navbar={Navbar} Footer={Footer} />
                  </VizBuilderProviders>
                </Route>
                <Route path="/">
                  <AdminPanelProviders>
                    <AdminPanel />
                  </AdminPanelProviders>
                </Route>
                <Redirect to="/login" />
              </Switch>
            </ThemeProvider>
          </MuiThemeProvider>
        </StylesProvider>
      </StoreProvider>
    </Suspense>
  </Router>,
  document.getElementById('root'),
);

if (module.hot) {
  module.hot.accept();
}
