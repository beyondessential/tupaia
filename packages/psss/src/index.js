/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { render as renderReactApp } from 'react-dom';
import { createStore, compose, applyMiddleware } from 'redux';
import { persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import { createReducers } from './createReducers';
import App from './App';
import { API, FakeAPI } from './api';
import { AppProviders } from './AppProviders';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

function initStore() {
  const persistConfig = { key: 'psss', storage };
  if (process.env.NODE_ENV !== 'development') {
    persistConfig.whitelist = ['auth']; // apart from auth, persist is used for a dev experience, but not required in production
  }
  const persistedReducers = persistCombineReducers(persistConfig, createReducers());
  const enhancers = composeEnhancers(
    applyMiddleware(thunk.withExtraArgument({ api: API, fakeApi: FakeAPI })),
  );

  const store = createStore(persistedReducers, {}, enhancers);
  API.injectReduxStore(store);

  return store;
}

const store = initStore();

const render = () => {
  return renderReactApp(
    <AppProviders store={store}>
      <App />
    </AppProviders>,
    document.getElementById('root'),
  );
};

render(App);

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    render(NextApp);
  });
}
