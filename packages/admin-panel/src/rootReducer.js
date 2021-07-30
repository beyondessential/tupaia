/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { combineReducers } from 'redux';
import { reducer as authentication, LOGOUT } from './authentication';
import { reducer as tables } from './table';
import { reducer as autocomplete } from './autocomplete/reducer'; // Needs to be imported from reducer file or console shows autocomplete not found error
import { reducer as editor } from './editor';
import { reducer as dataChangeListener } from './dataChangeListener';

const appReducer = combineReducers({
  authentication,
  tables,
  autocomplete,
  editor,
  dataChangeListener,
});

export const rootReducer = (state, action) => {
  // on logout, wipe all redux state except auth
  if (action.type === LOGOUT) {
    return appReducer({ authentication: state.authentication }, action);
  }

  return appReducer(state, action);
};
