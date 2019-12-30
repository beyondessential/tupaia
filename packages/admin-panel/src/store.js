/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';
import { persistStore } from 'redux-persist';
import createHistory from 'history/createBrowserHistory';
import { TupaiaApi } from './api';
import { rootReducer } from './rootReducer';

export const history = createHistory();

const api = new TupaiaApi();

const initialState = {};
const enhancers = [];
const middleware = [thunk.withExtraArgument({ api }), routerMiddleware(history)];

if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.devToolsExtension;
  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}

const composedEnhancers = compose(
  applyMiddleware(...middleware),
  ...enhancers,
);

export const store = createStore(rootReducer, initialState, composedEnhancers);

api.injectReduxStore(store);

export const persistor = persistStore(store);
