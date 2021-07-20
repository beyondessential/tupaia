/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { render as renderReactApp } from 'react-dom';
import 'react-table/react-table.css';
import AdminPanel from './App';
import { AdminPanelProviders, VizBuilderProviders } from './utilities';
import { Footer, Navbar } from './widgets';

const VizBuilder = lazy(() => import('./VizBuilderApp'));

renderReactApp(
  <Router>
    <Suspense fallback={<div>loading...</div>}>
      <Switch>
        <Route path="/viz-builder" exact>
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
    </Suspense>
  </Router>,
  document.getElementById('root'),
);
