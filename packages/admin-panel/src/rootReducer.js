import { combineReducers } from 'redux';
import { LOGOUT } from './authentication';
import { reducer as tables } from './table';
import { reducer as autocomplete } from './autocomplete/reducer'; // Needs to be imported from reducer file or console shows autocomplete not found error
import { reducer as editor } from './editor';
import { reducer as logs } from './logsTable';
import { reducer as dataChangeListener } from './dataChangeListener';
import { reducer as usedBy } from './usedBy';
import { reducer as qrCode } from './qrCode';
import { reducer as surveyResponse } from './surveyResponse';

const appReducer = combineReducers({
  tables,
  autocomplete,
  editor,
  logs,
  dataChangeListener,
  usedBy,
  qrCode,
  surveyResponse,
});

export const rootReducer = (state, action) => {
  // on logout, wipe all redux state
  if (action.type === LOGOUT) {
    return appReducer({}, action);
  }

  return appReducer(state, action);
};
