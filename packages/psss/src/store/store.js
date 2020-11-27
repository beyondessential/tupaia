/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createStore, compose, applyMiddleware } from 'redux';
import { persistReducer } from 'redux-persist';
import thunk from 'redux-thunk';
import storage from 'redux-persist/lib/storage';
import { rootReducer } from './rootReducer';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export function initStore() {
  const persistConfig = { key: 'psss', storage };
  if (process.env.NODE_ENV !== 'development') {
    persistConfig.whitelist = ['auth']; // apart from auth, persist is used for a dev experience, but not required in production
  }
  const persistedReducer = persistReducer(persistConfig, rootReducer);
  const enhancers = composeEnhancers(applyMiddleware(thunk.withExtraArgument({})));

  const store = createStore(persistedReducer, {}, enhancers);
  // Todo: remove injecting store
  // @see: https://app.zenhub.com/workspaces/tupaia-sprint-board-5eea9d3de8519e0019186490/issues/beyondessential/tupaia-backlog/1566
  // After the API reference is removed from here it would be good to refactor this file to export the store itsself as opposed to a function to init the store

  return store;
}
