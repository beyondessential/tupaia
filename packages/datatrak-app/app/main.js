/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { AppRegistry, AsyncStorage } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import { persistStore, persistCombineReducers, createTransform } from 'redux-persist';
import { ErrorHandler } from 'redux-persist-error-handler';

import { Meditrak } from './Meditrak';
import { TupaiaApi } from './api';
import { DatabaseAccess } from './database';
import { reducers } from './reducers';
import { createMiddleware } from './middleware';
import { analytics, linkPushNotificationsToReduxStore, CrashReporter } from './utilities';
import { isBeta, betaBranch } from './version';

const api = new TupaiaApi();
const database = new DatabaseAccess(api);
const crashReporter = new CrashReporter(analytics);

const composer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const enhancers = composer(
  createMiddleware({
    api,
    database,
    analytics,
    crashReporter,
  }),
);

const persistedReducers = persistCombineReducers(
  {
    key: isBeta ? betaBranch : 'primary',
    storage: AsyncStorage,
    transforms: [
      createTransform(inboundState => {
        // Do not persist loading state.
        if (inboundState && inboundState.isLoading) {
          return {
            ...inboundState,
            isLoading: false,
          };
        }
        return inboundState;
      }),
    ],
  },
  reducers,
);

const store = createStore(persistedReducers, {}, enhancers);

api.injectReduxStore(store);
crashReporter.injectReduxStore(store);
linkPushNotificationsToReduxStore(store);

const persistedStore = persistStore(store);
// persistedStore.purge(); // Uncomment this to wipe bad redux state during development

const App = () => (
  <ErrorHandler persistedStore={persistedStore}>
    <Provider store={store}>
      <Meditrak database={database} />
    </Provider>
  </ErrorHandler>
);

AppRegistry.registerComponent('TupaiaMediTrak', () => App);
