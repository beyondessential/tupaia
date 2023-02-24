/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { render as renderReactApp } from 'react-dom';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import 'react-table/react-table.css';
import { EnvBanner } from '@tupaia/ui-components';
import AdminPanel from './App';
import { AdminPanelProviders } from './utilities/AdminPanelProviders';
import { StoreProvider } from './utilities/StoreProvider';
import { Footer, Navbar } from './widgets';
import { TupaiaApi } from './api';
import { theme } from './theme';

const VizBuilder = lazy(() => import('./VizBuilderApp'));

const api = new TupaiaApi();
const queryClient = new QueryClient();

renderReactApp(
  <Router>
    <Suspense fallback={<div>loading...</div>}>
      {/* Store provider applied above routes so that it always persists auth state */}
      <StoreProvider api={api} persist>
        <QueryClientProvider client={queryClient}>
          <EnvBanner />
          <StylesProvider injectFirst>
            <MuiThemeProvider theme={theme}>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <Switch>
                  <Route path="/viz-builder">
                    <VizBuilder Navbar={Navbar} Footer={Footer} />
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
        </QueryClientProvider>
      </StoreProvider>
    </Suspense>
  </Router>,
  document.getElementById('root'),
);

if (module.hot) {
  module.hot.accept();
}
