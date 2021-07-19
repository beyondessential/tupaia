/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { render as renderReactApp } from 'react-dom';
import 'react-table/react-table.css';
import { App } from './App';
import { App as VizBuilder } from './vizBuilder';
import { AdminPanelProviders, VizBuilderProviders } from './utilities';

renderReactApp(
  <Router>
    <Switch>
      <Route path="/viz-builder" exact>
        <VizBuilderProviders>
          <VizBuilder />
        </VizBuilderProviders>
      </Route>
      <Route path="/">
        <AdminPanelProviders>
          <App />
        </AdminPanelProviders>
      </Route>
      <Redirect to="/login" />
    </Switch>
  </Router>,
  document.getElementById('root'),
);
