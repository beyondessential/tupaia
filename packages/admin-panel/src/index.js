/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { render as renderReactApp } from 'react-dom';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-table/react-table.css';

import { history, store, persistor } from './store';
import { AppContainer } from './App';
import './index.css';

const RoutingApp = withRouter(AppContainer);

renderReactApp(
  <Provider store={store}>
    <PersistGate persistor={persistor} loading={null}>
      <ConnectedRouter history={history}>
        <RoutingApp />
      </ConnectedRouter>
    </PersistGate>
  </Provider>,
  document.getElementById('root'),
);
