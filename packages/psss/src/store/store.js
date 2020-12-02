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

persistConfig.whitelist = ['auth'];

const persistedReducer = persistReducer(persistConfig, rootReducer);

const enhancers = composeEnhancers(applyMiddleware(thunk));

const store = createStore(persistedReducer, {}, enhancers);

apiErrorHandler(store);

export { store };
