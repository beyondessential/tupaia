/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createStore, compose, applyMiddleware, combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import thunk from 'redux-thunk';
import storage from 'redux-persist/lib/storage';
import { apiErrorHandler } from '../api/apiErrorHandler';

import { auth } from './auth';
import { weeklyReports } from './weeklyReports';

const rootReducer = combineReducers({
  auth: persistReducer({ key: 'auth', storage, whitelist: ['user', 'isLoggedIn'] }, auth),
  weeklyReports,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const enhancers = composeEnhancers(applyMiddleware(thunk));

const store = createStore(rootReducer, {}, enhancers);

apiErrorHandler(store);

export { store };
