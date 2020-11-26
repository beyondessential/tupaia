/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createStore } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { rootReducer } from './rootReducer';

// Todo: refactor to return store rather than initStore
export function initStore() {
  const persistConfig = { key: 'psss', storage };
  if (process.env.NODE_ENV !== 'development') {
    persistConfig.whitelist = ['auth']; // apart from auth, persist is used for a dev experience, but not required in production
  }
  const persistedReducer = persistReducer(persistConfig, rootReducer);

  return createStore(persistedReducer, {});
}
