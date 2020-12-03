/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createStore, compose, applyMiddleware } from 'redux';
import { persistReducer } from 'redux-persist';
import thunk from 'redux-thunk';
import storage from 'redux-persist/lib/storage';
import { rootReducer } from './rootReducer';
import { apiErrorHandler } from '../api/apiErrorHandler';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const persistConfig = { key: 'psss', storage };

if (process.env.NODE_ENV !== 'development') {
  persistConfig.whitelist = ['auth']; // apart from auth, persist is used for a dev experience, but not required in production
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

const enhancers = composeEnhancers(applyMiddleware(thunk));

const store = createStore(persistedReducer, {}, enhancers);

apiErrorHandler(store);

export { store };
