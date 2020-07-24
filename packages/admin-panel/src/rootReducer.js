/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import localforage from 'localforage';
import { reducer as authentication } from './authentication';
import { reducer as tables } from './table';
import { reducer as importExport } from './importExport';
import { reducer as autocomplete } from './autocomplete';
import { reducer as editor } from './editor';
import { reducer as dataChangeListener } from './dataChangeListener';

const persistedAuthenticationReducer = persistReducer(
  {
    key: 'authentication',
    storage: localforage,
    whitelist: ['emailAddress', 'accessToken', 'user', 'refreshToken'], // TODO change back to just emailAddress when done with development
  },
  authentication,
);

export const rootReducer = combineReducers({
  authentication: persistedAuthenticationReducer,
  tables,
  importExport,
  autocomplete,
  editor,
  dataChangeListener,
});
