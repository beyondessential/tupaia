/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { lazy, Suspense } from 'react';
import { Provider } from 'react-redux';

import configureStore from './configureStore';
import { AppStyleProviders } from './AppStyleProviders';
import { initHistoryDispatcher } from './historyNavigation';
import { FETCH_INITIAL_DATA } from './actions';

const DesktopApp = lazy(() => import('./screens/desktop/RootScreen'));
const MobileApp = lazy(() => import('./screens/mobile/RootScreen'));

const store = configureStore();
const { dispatch } = store;

initHistoryDispatcher(store);

const initApp = () => {
  dispatch({
    type: FETCH_INITIAL_DATA,
  });
};

initApp();

const appType = process.env.REACT_APP_APP_TYPE;

// Todo: fix export issues
const App = () => {
  let RootScreen = DesktopApp;

  if (appType === 'mobile') {
    RootScreen = MobileApp;
  }

  return (
    <Provider store={store}>
      <AppStyleProviders>
        <Suspense fallback={null}>
          <RootScreen />
        </Suspense>
      </AppStyleProviders>
    </Provider>
  );
};

export default App;
