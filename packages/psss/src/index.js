/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { render } from 'react-dom';
import { createStore, compose, applyMiddleware } from 'redux';
import { persistStore, persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { PersistGate } from 'redux-persist/integration/react';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from 'styled-components';
import { createReducers } from './createReducers';
import { theme } from './theme';
import App from './App';
import { API } from './api';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line no-underscore-dangle

function initStore() {
  const persistConfig = { key: 'psss', storage };
  if (process.env.NODE_ENV !== 'development') {
    persistConfig.whitelist = []; // persist used for a dev experience, but not required in production
  }
  const persistedReducers = persistCombineReducers(persistConfig, createReducers());
  const enhancers = composeEnhancers(applyMiddleware(thunk.withExtraArgument({ api: API })));
<<<<<<< HEAD
  return createStore(persistedReducers, {}, enhancers);
=======

  const store = createStore(persistedReducers, {}, enhancers);
  API.injectReduxStore(store);

  return store;
>>>>>>> origin/420-psss-auth-gateway
}

function initPersistor(store) {
  const persistor = persistStore(store, null);

  // if you run into problems with redux state, call "purge()" in the dev console
  if (window.localStorage.getItem('queuePurge')) {
    persistor.purge();
    window.localStorage.setItem('queuePurge', '');
  }

  window.purge = () => {
    window.localStorage.setItem('queuePurge', 'true');
    window.location.reload();
  };

  return persistor;
}

if (module.hot) {
  module.hot.accept();
}

const store = initStore();

render(
  <Provider store={store}>
    <PersistGate persistor={initPersistor(store)}>
      <StylesProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </MuiThemeProvider>
      </StylesProvider>
    </PersistGate>
  </Provider>,
  document.getElementById('root'),
);
