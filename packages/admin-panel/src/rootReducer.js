/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { combineReducers } from 'redux';
import { reducer as authentication } from './authentication';
import { reducer as profile } from './profile';
import { reducer as tables } from './table';
import { reducer as importExport } from './importExport';
import { reducer as autocomplete } from './autocomplete';
import { reducer as editor } from './editor';
import { reducer as dataChangeListener } from './dataChangeListener';

export const rootReducer = combineReducers({
  authentication,
  profile,
  tables,
  importExport,
  autocomplete,
  editor,
  dataChangeListener,
});
