/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, lazy, Suspense } from 'react';
import { Provider } from 'react-redux';

import configureStore from './configureStore';
import { AppStyleProviders } from './AppStyleProviders';
import { reactToInitialState, initHistoryDispatcher } from './historyNavigation';
import { fetchInitialData, findLoggedIn } from './actions';
import { LOGIN_TYPES } from './constants';

const DesktopApp = lazy(() => import('./screens/desktop/RootScreen'));
const MobileApp = lazy(() => import('./screens/mobile/RootScreen'));
const ExporterApp = lazy(() => import('./screens/exporter/RootScreen'));

const store = configureStore();
const { dispatch } = store;

initHistoryDispatcher(store);

const appType = process.env.REACT_APP_APP_TYPE;

const initApp = () => {
  dispatch(fetchInitialData());
  dispatch(findLoggedIn(LOGIN_TYPES.AUTO));
  reactToInitialState(store);
};

const App = () => {
  useEffect(initApp, []);

  let RootScreen = DesktopApp;

  if (appType === 'mobile') {
    RootScreen = MobileApp;
  } else if (appType === 'exporter') {
    RootScreen = ExporterApp;
  }

  return (
    <Provider store={store}>
      <AppStyleProviders>
        <Suspense fallback={<div>loading...</div>}>
          <RootScreen />
        </Suspense>
      </AppStyleProviders>
    </Provider>
  );
};

export default App;
