/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import localforage from 'localforage';
import { persistReducer, persistStore } from 'redux-persist';
import { TupaiaApi } from './api';
import { rootReducer } from './rootReducer';
import { RememberMeTransform } from './authentication/reducer';

const api = new TupaiaApi();

const persistedRootReducer = persistReducer(
  {
    key: 'root',
    storage: localforage,
    transforms: [RememberMeTransform],
  },
  rootReducer,
);

const initialState = {};
const enhancers = [];
const middleware = [thunk.withExtraArgument({ api })];

if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.devToolsExtension;
  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}

const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);

export const store = createStore(persistedRootReducer, initialState, composedEnhancers);

api.injectReduxStore(store);

export const persistor = persistStore(store);
